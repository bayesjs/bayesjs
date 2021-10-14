import {
  INetwork,
  IInferenceEngine, ICptWithParents, ICptWithoutParents, IInferAllOptions,
} from '../types'
import { createICliqueFactors } from '../inferences/junctionTree/create-initial-potentials'
import { reduce } from 'ramda'

import createCliques from '../inferences/junctionTree/create-cliques'
import { getConnectedComponents } from '../utils/connected-components'
import { cptToFastPotential, FastPotential, fastPotentialToCPT } from './FastPotential'
import { FastClique } from './FastClique'
import { FastNode } from './FastNode'
import { NodeId, CliqueId, ConnectedComponentId, FormulaId } from './common'
import { Formula, NodePotential, FormulaType, reference, mult, EvidenceFunction, updateReferences, marginalize } from './Formula'
import { messageName, propagatePotentials } from './symbolic-propagation'
import { evaluate } from './evaluation'

const getNetworkInfo = (network: INetwork) => {
  const { cliques, sepSets, junctionTree } = createCliques(network)

  const factorMap = createICliqueFactors(cliques, network)
  const ccs = getConnectedComponents(junctionTree)

  const numberOfConnectedComponents = ccs.length
  const numberOfMessages = 2 * (cliques.length - numberOfConnectedComponents)
  const numberOfCliques = cliques.length
  const numberOfNodes = Object.keys(network).length
  const numberOfFormulas = numberOfNodes + numberOfCliques * 4 + numberOfMessages
  const cliqueOffset = numberOfNodes
  const messageOffset = cliqueOffset + numberOfCliques * 4

  const nodeMap: { [nodename: string]: number } = {}
  Object.keys(network).forEach((k, i) => { nodeMap[k] = i })
  const cliqueMap: { [cliquename: string]: number} = {}
  Object.values(cliques).forEach((k, i) => { cliqueMap[k.id] = i })

  const connectedComponents = ccs.map(cc => cc.map(cliqueName => cliqueMap[cliqueName]))
  const roots: CliqueId[] = connectedComponents.map(xs => xs[0])

  const ccMap: { [cliqueId: string]: ConnectedComponentId} = {}
  ccs.forEach((cc, i) => {
    cc.forEach(cliqueId => {
      ccMap[cliqueId.toString()] = i
    })
  })

  const sepSetMap: { [cliqueId: string]: { [cliqueId: string]: number }} = {}
  const separators: number[][] = []
  const separatorNameToId: { [name: string]: number} = {}
  sepSets.forEach(({ ca, cb, sharedNodes }) => {
    const a = ca
    const b = cb
    if (!sepSetMap[a.toString()]) sepSetMap[a.toString()] = {}
    if (!sepSetMap[b.toString()]) sepSetMap[b.toString()] = {}
    const members: NodeId[] = sharedNodes.map((nodename: string) => nodeMap[nodename])
    const name = members.sort().toString()
    if (!separatorNameToId[name]) {
      separatorNameToId[name] = separators.length
      separators.push(members)
    }
    const idx = separatorNameToId[name]
    sepSetMap[a.toString()][b.toString()] = idx
    sepSetMap[b.toString()][a.toString()] = idx
  })

  return {
    cliques,
    separators,
    junctionTree,
    connectedComponents,
    factorMap,
    cliqueMap,
    nodeMap,
    sepSetMap,
    ccMap,
    numberOfCliques,
    numberOfConnectedComponents,
    numberOfFormulas,
    numberOfNodes,
    numberOfMessages,
    cliqueOffset,
    messageOffset,
    roots,
  }
}

const upsertFormula = (formulas: Formula[], formulaLookup: { [name: string]: number}) => (formula: Formula) => {
  switch (formula.kind) {
    case FormulaType.EVIDENCE_FUNCTION :
    case FormulaType.NODE_POTENTIAL :
    case FormulaType.PRODUCT :
    case FormulaType.MARGINAL : {
      const idx = formulaLookup[formula.name]
      if (idx == null) {
        // the formula has not already been cached.
        formula.id = formulas.length
        formulaLookup[formula.name] = formula.id
        formulas.push(formula)
        return formula
      } else {
        // the formula already is in the collection!  We can look up the previously cached value and
        // return it.
        return formulas[idx]
      }
    }
    case FormulaType.REFERENCE: {
      const deref = formulas[formula.id]
      if (deref) {
        return deref
      } else {
        // there is no function at the specified index.   This should never happen that
        // we have a null reference!
        throw new Error(`Null reference to formula ${formula.id}`)
      }
    }
    case FormulaType.UNIT:
      // NEVER ADD THE UNIT POTENTIAL!  It should already be optimized away from being included
      // directly in any result.
      return formula
  }
}

export class LazyPropagationEngine implements IInferenceEngine {
  private _cliques: FastClique[]
  private _nodes: FastNode[]
  private _potentials: (FastPotential | null)[]
  private _formulas: Formula[]
  private _connectdComponents: NodeId[][]
  private _separators: NodeId[][]
  private _separatorPotentials: FormulaId[] =[]

  private clearCachedValues = (root: FormulaId) => {
    console.log(`clearing cache from ${root}`)
    const ps = this._nodes.map(x => this._potentials[x.id])
    this._potentials = ps
    // const f = this._formulas[root]
    // const p = this._potentials[root]
    // if (!p) return
    // this._potentials[root] = null
    // f.refrerencedBy.forEach(childId => this.clearCachedValues(childId))
  }

  constructor (network: INetwork) {
    const info = getNetworkInfo(network)
    const { cliques, junctionTree, connectedComponents, separators } = info
    const { nodeMap, cliqueMap, factorMap, ccMap, sepSetMap } = info
    const { numberOfCliques, numberOfNodes } = info

    const fs: Formula[] = []
    const ns: FastNode[] = Array(numberOfNodes)
    const cs: FastClique[] = Array(numberOfCliques)
    const ccs: number[][] = connectedComponents.map(cc => cc.map(cliqueName => cliqueMap[cliqueName]))
    const upsert = upsertFormula(fs, {})

    // Initialize the collection of nodes using the fast integer indexing.
    // note that some of the fields (children, cliques, factorAssignedTo)
    // cannot be populated on the initial pass.
    Object.values(network).forEach((node, i) => {
      const fastnode = {
        id: i,
        name: node.id,
        parents: node.parents.map(parentname => nodeMap[parentname]),
        children: [],
        referencedBy: [i],
        formula: i,
        posteriorMarginal: 0,
        evidenceFunction: i + numberOfNodes,
        cliques: [],
        factorAssignedTo: 0,
        levels: node.states,
      }
      upsert(new NodePotential(fastnode, ns))
      ns[i] = fastnode
    })

    // Populate the parents of each node.   This is done in a second pass
    // to ensure that all the elements of the nodes collection have already
    // been populated.
    ns.forEach((node: FastNode) => {
      const { id, parents } = node
      parents.forEach(parentId => {
        ns[parentId].children.push(id)
      })

      node.evidenceFunction = upsert(new EvidenceFunction(node)).id
    })

    // Initialize the collection of cliques using the fast integer indexing.
    cliques.forEach((clique, i) => {
      const neighs: string[] = junctionTree.getNodeEdges(clique.id)
      const neighbors: number[] = neighs.map(neighborname => cliqueMap[neighborname])
      const domain = clique.nodeIds.map(nodename => nodeMap[nodename]).sort()
      const factors = factorMap[clique.id].map(nodename => nodeMap[nodename])
      const prior = 2 * numberOfNodes + i
      const posterior = prior + numberOfCliques
      const fastclique = {
        id: i,
        name: clique.id,
        factors,
        domain,
        neighbors,
        prior,
        posterior,
        messagesReceived: [],
        belongsTo: ccMap[i.toString()],
        separators: neighs.map(neigh => sepSetMap[clique.id][neigh]),
      }
      // append the clique to the fast cliques collection.
      cs[i] = fastclique

      // For each node in this clique, append the reverse lookup information
      // in the corresponding fast node.
      domain.forEach(nodeId => { ns[nodeId].cliques.push(i) })

      // Populate the prior potentials for the clique.  Make sure that the
      // reference count for the factor nodes is updated.
      fastclique.prior = upsert(mult(factors.map(nodeId => reference(nodeId, fs)))).id
    })

    const messages = propagatePotentials(cs, separators, upsert, fs, info.roots)

    // Construct the posterior potentials for each clique using the messages
    // propagated between each potential.

    cs.forEach(clique => {
      const msgs: Formula[][] = clique.neighbors.map(x => messages[messageName(x, clique.id)])
      clique.messagesReceived = msgs.map(xs => xs.filter(x => x.kind !== FormulaType.UNIT).map(x => x.id))
      clique.posterior = upsert(mult([reference(clique.prior, fs), ...reduce((acc: Formula[], xs: Formula[]) => { acc.push(...xs); return acc }, [], msgs)])).id
    })

    // create posterior separator potentials.   These will always be smaller than the clique potentials
    // and may be useful in rapidly computing posterior marginals of nodes.
    separators.map((ns, i) => {
      const cliques = cs.filter(c => c.separators.includes(i))
      if (cliques.length < 2) throw new Error(`Could not find a pair of cliques connected by separator ${ns}`)
      const [ca] = cliques
      const ia: number = ca.separators.findIndex(x => x === i)
      const fa: Formula = fs[ca.posterior]
      const cb: FastClique = cs.find(x => x.id === ca.neighbors[ia]) as FastClique
      const fb: Formula = fs[cb.posterior]
      const cliquePotential = fa.size < fb.size ? fa : fb
      this._separatorPotentials.push(upsert(marginalize(ns, cliquePotential, fs)).id)
    })

    // Assign the posterior marignals for each node.  Since the posterior marginals have
    // been made consistent by message passing, we can pick the smallest potential.
    ns.forEach(fastNode => {
      let baseFormula: Formula = fs[cs[fastNode.cliques[0]].posterior]
      if (fastNode.cliques.length > 1) {
        // Find the smallest separator set that contains the node.   Then marginalize that
        // separator

        this._separatorPotentials.forEach((formId: number) => {
          const f: Formula = fs[formId]
          if (f.domain.includes(fastNode.id)) {
            if (f.size < baseFormula.size) {
              baseFormula = f
            }
          }
        })
      } else {
      }
      fastNode.posteriorMarginal = upsert(marginalize([fastNode.id], baseFormula, fs)).id
    })

    const ps = Array(fs.length)
    // Convert the cpts for each variable into a potential function
    // and cache at the same index as the node.
    ns.forEach((node, i) => {
      ps[i] = cptToFastPotential(node, network[node.name].cpt, ns)
      // node.posteriorMarginal = pickMarginal(node.id, cliques, formulas)
    })

    updateReferences(fs)
    // Set the values of the priavate properties.
    this._nodes = ns
    this._cliques = cs
    this._formulas = fs
    this._potentials = ps
    this._connectdComponents = ccs
    this._separators = separators
  }

  hasVariable = (name: string) => this._nodes.map(x => x.name).includes(name)
  getVariables = () => this._nodes.map(x => x.name)

  getParents = (name: string) => {
    const node = this._nodes.find(x => x.name === name)
    if (!node) return []
    return node.parents.map(i => this._nodes[i].name)
  }

  hasParent = (name: string, parent: string) => this.getParents(name).includes(parent)

  getLevels = (name: string) => {
    const node = this._nodes.find(x => x.name === name)
    if (!node) return []
    return node.levels
  }

  hasLevel = (name: string, level: string) => this.getLevels(name).includes(level)

  getDistribution = (name: string) => {
    const node = this._nodes.find(x => x.name === name)
    if (!node) return []
    return fastPotentialToCPT(node.id, this._nodes, this._potentials[node.id] || [])
  }

  setDistribution = (name: string, distribution: ICptWithoutParents | ICptWithParents) => {
    const node = this._nodes.find(x => x.name === name)
    if (node) {
      this.clearCachedValues(node.id)
      this._potentials[node.id] = cptToFastPotential(node, distribution, this._nodes)
    }
  }

  hasEvidenceFor = (name: string) => {
    const node = this._nodes.find(x => x.name === name)
    if (!node) {
      return false
    }
    return (this._formulas[node.evidenceFunction] as EvidenceFunction).level != null
  }

  getEvidence = (name: string) => {
    const node = this._nodes.find(x => x.name === name)
    if (!node) {
      return false
    }
    const lvl = (this._formulas[node.evidenceFunction] as EvidenceFunction).level
    if (!lvl) return null
    return node.levels[lvl]
  }

  updateEvidence = (evidence: { [name: string]: string}) => {
    Object.keys(evidence).forEach(name => {
      const node = this._nodes.find(x => x.name === name)
      if (node) {
        const evidenceFunc = this._formulas[node.evidenceFunction] as EvidenceFunction
        const lvlIdx = node.levels.findIndex(x => x === evidence[name])
        if (lvlIdx >= 0 && lvlIdx !== evidenceFunc.level) {
          evidenceFunc.level = lvlIdx
          this.clearCachedValues(evidenceFunc.id)
        }
      }
    })
  }

  setEvidence = (evidence: { [name: string]: string}) => {
    this.removeAllEvidence()
    this.updateEvidence(evidence)
  }

  removeEvidence = (name: string) => {
    const node = this._nodes.find(x => x.name === name)
    if (node) {
      const evidenceFunc = this._formulas[node.evidenceFunction] as EvidenceFunction
      if (evidenceFunc.level != null) {
        evidenceFunc.level = null
        this.clearCachedValues(evidenceFunc.id)
      }
    }
  }

  removeAllEvidence = () =>
    this._nodes.forEach(node => {
      const evidenceFunc = this._formulas[node.evidenceFunction] as EvidenceFunction
      if (evidenceFunc.level != null) {
        evidenceFunc.level = null
        this.clearCachedValues(evidenceFunc.id)
      }
    })

  /** Given a single node,  infer the probability of an event from the
   * posterior marginal distribution for that node.
   */
  private inferFromMarginal (nodeId: NodeId, level: number) {
    const p = evaluate(this._nodes[nodeId].posteriorMarginal, this._nodes, this._formulas, this._potentials)
    return p[level]
  }

  private inferFromJointDistribution (nodeIds: NodeId[], levels: number[]) {
    console.log(`inferFromJointDistribution not yet implemented.   args: ${nodeIds}, levels: ${levels}`)
    return 0
  }

  private inferFromClique (nodeIds: NodeId[], levels: number[], clique: CliqueId) {
    console.log(`inferFromClique not yet implemented.   args: ${nodeIds}, levels: ${levels}, clique: ${clique}`)
    return 0
  }

  infer = (event: { [name: string]: string}) => {
    const names = Object.keys(event)
    if (names.length === 0) return 1
    const idxs = names.map(name => this._nodes.findIndex(node => node.name === name))

    if (idxs.some(idx => idx === -1)) return 0
    const levels: number[] = names.map((name, i) => this._nodes[idxs[i]].levels.findIndex(lvl => lvl === event[name]))
    if (levels.some(lvl => lvl === -1)) return 0
    if (idxs.length === 1) return this.inferFromMarginal(idxs[0], levels[0])

    const cs = this._cliques.filter(clique => idxs.every(idx => clique.domain.includes(idx))).sort((a, b) => a.domain.length - b.domain.length)

    if (cs.length === 0) return this.inferFromJointDistribution(idxs, levels)

    return this.inferFromClique(idxs, levels, cs[0].id)
  }

  inferAll = (options?: IInferAllOptions) => {
    console.log(`inferAll(${options}) not yet implemented`)
    return {}
  }
}
