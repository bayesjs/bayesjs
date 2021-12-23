import {
  INetworkResult,
  IInferenceEngine, IInferAllOptions, ICptWithParents, ICptWithoutParents,
} from '../types'
import { clone } from 'ramda'
import roundTo = require('round-to')

import { FastPotential, indexToCombination } from './FastPotential'
import { FastClique } from './FastClique'
import { FastNode } from './FastNode'
import { NodeId, CliqueId, FormulaId } from './common'
import { Formula, EvidenceFunction, updateReferences } from './Formula'
import { propagatePotentials } from './symbolic-propagation'
import { evaluate } from './evaluation'
import { getNetworkInfo, initializeCliques, initializeEvidence, initializeNodeParents, initializeNodes, initializePosteriorCliquePotentials, initializePosteriorNodePotentials, initializePriorNodePotentials, initializeSeparatorPotentials, NetworkInfo, upsertFormula, setDistribution } from './util'
import { Distribution } from './Distribution'
import { arbitraryJoin } from './arbitrary-join'

/** This inference engine uses a modified version of the lazy cautious message
 * propigation strategy described in:
 * "Lazy Propagation: A Junction Tree Inference Algorithm based on Lazy evaluation"
 * by Madsen and Jensen.
 *
 * This implementation extends the algorithm described by the authors by using
 * a symbolic message passing architecture.   Message passing populates a
 * collection of formulas for each message and posterior marginals using the
 * AST that is made explicit in the Formula type.  The syntax of the ASTs has
 * been chosen so that it can be performed once, and need not be updated with
 * changes in either hard or soft evidence.
 *
 * The potentials are evaluated upon demand whenever the infer function is
 * called.   The inference results and the results of any intermediate
 * computations are stored in the potentials cache to facilitate subsequent
 * inferences.   This separation of concerns between message passing and
 * evaluation allows not only fast retraction of hard evidence, but also
 * replacement of potential functions for individual nodes of the Bayes
 * network without invalidating the entire cache.
 *
 */
export class LazyPropagationEngine implements IInferenceEngine {
  private _cliques: FastClique[]
  private _nodes: FastNode[]
  private _potentials: (FastPotential | null)[]
  private _formulas: Formula[]
  private _connectedComponents: NodeId[][]
  private _separators: NodeId[][]
  private _separatorPotentials: FormulaId[] =[]

  /** This function recursively clears the cached potentials starting from the given
   * formula id.   It terminates the recursion down any branch when it encounters
   * a cached value that is null, because this implies that all cached values that
   * are depends of that potential are also null.
   */
  private clearCachedValues = (root: FormulaId) => {
    const f = this._formulas[root]
    const p = this._potentials[root]
    // If the cache rooted on this node has already been cleared, then
    // exit.
    if (!p) return
    // otherwise, clear this node and (recursively) all its children
    this._potentials[root] = null
    f.refrerencedBy.forEach(childId => this.clearCachedValues(childId))
  }

  constructor (network: {[name: string]: {
    id: string;
    states: string[];
    parents: string[];
    potentialFunction?: FastPotential;
    distribution?: Distribution;
    cpt?: ICptWithParents | ICptWithoutParents;
  };}) {
    const info: NetworkInfo = getNetworkInfo(network)
    const { connectedComponents, separators } = info
    const { nodeMap, cliqueMap } = info
    const { numberOfCliques, numberOfNodes } = info

    const fs: Formula[] = []
    const ns: FastNode[] = Array(numberOfNodes)
    const cs: FastClique[] = Array(numberOfCliques)
    const ccs: number[][] = connectedComponents.map(cc => cc.map(cliqueName => cliqueMap[cliqueName]))
    const upsert = upsertFormula(fs, {})

    initializeNodes(network, nodeMap, upsert, ns)
    initializeNodeParents(ns)
    initializeEvidence(ns, upsert)
    initializeCliques(info, upsert, ns, cs, fs)
    const messages = propagatePotentials(cs, separators, upsert, fs, info.roots)
    initializePosteriorCliquePotentials(upsert, ns, cs, messages, fs)
    this._separatorPotentials = initializeSeparatorPotentials(info, upsert, cs, fs)
    initializePosteriorNodePotentials(upsert, ns, cs, fs, this._separatorPotentials)
    const ps: FastPotential[] = new Array(fs.length)
    initializePriorNodePotentials(network, ps, ns)
    updateReferences(fs)

    // Set the values of the private properties.
    this._nodes = ns
    this._cliques = cs
    this._formulas = fs
    this._potentials = ps
    this._connectedComponents = ccs
    this._separators = separators
  }

  // Implmentation of the hasVariable interface function.  Returns true
  // if and only if there is a variable with the given name
  hasVariable = (name: string) => this._nodes.map(x => x.name).includes(name)

  // Implementation of the getVariables interface function.
  getVariables = () => this._nodes.map(x => x.name)

  // Implementation of teh getParents interface function.
  getParents = (name: string) => {
    const node = this._nodes.find(x => x.name === name)
    if (!node) return []
    return node.parents.map(i => this._nodes[i].name)
  }

  // Implementation of the hasParent interface function
  hasParent = (name: string, parent: string) => this.getParents(name).includes(parent)

  // implementation of the getLevels interface function
  getLevels = (name: string) => {
    const node = this._nodes.find(x => x.name === name)
    if (!node) return []
    return node.levels
  }

  // implementation of the hasLevel interface function
  hasLevel = (name: string, level: string) => this.getLevels(name).includes(level)

  // implementation of the getDistribution interface function.
  // this returns the prior distribution for the given variable.
  getDistribution = (name: string) =>
    this.getJointDistribution([name], this._nodes.find(x => x.name === name)?.parents.map(i => this._nodes[i].name) || [])

  getJointDistribution = (headVariables: string[], parentVariables: string[]): Distribution => {
    // Sanity Checks
    const err = (reason: string) => {
      const msg = 'Cannot construct the joint distribution for the given head and parent variables.  ' + reason
      throw new Error(msg)
    }
    if (headVariables.some(name => this.hasEvidenceFor(name))) err('Hard evidence has been provided for some of the head variables.')
    if (parentVariables.some(name => this.hasEvidenceFor(name))) err('Hard evidence has been provided for some of the parent variables.')

    const parentIdxs: number[] = parentVariables.map(s => this._nodes.findIndex(node => node.name === s))
    const headIdxs: number[] = headVariables.map(s => this._nodes.findIndex(node => node.name === s))
    this._formulas.forEach(f => evaluate(f.id, this._nodes, this._formulas, this._potentials))
    const potentialFunction = arbitraryJoin(this._nodes, this._cliques, this._separators, this._separatorPotentials, this._formulas, this._potentials, headIdxs, parentIdxs)
    return new Distribution(headVariables.map(n => this._nodes.find(x => x.name === n)) as FastNode[], parentVariables.map(n => this._nodes.find(x => x.name === n)) as FastNode[], potentialFunction)
  }

  // implementation of the setDistribution interface function.
  // note that this clears the cache for any potential that is dependendent
  // either directly or indirectly on this value.
  setDistribution = (distribution: Distribution): boolean => {
    const nodeId = setDistribution(distribution, this._nodes, this._potentials)
    const p = this._potentials[nodeId]
    this.clearCachedValues(nodeId)
    this._potentials[nodeId] = p
    return true
  }

  // implementation of the hasEvidenceFor interface function.
  hasEvidenceFor = (name: string) => {
    const node = this._nodes.find(x => x.name === name)
    if (!node) {
      return false
    }
    return (this._formulas[node.evidenceFunction] as EvidenceFunction).level != null
  }

  // implementation of the getEvidence interface function
  getEvidence = (name: string) => {
    const node = this._nodes.find(x => x.name === name)
    if (!node) {
      return false
    }
    const lvl = (this._formulas[node.evidenceFunction] as EvidenceFunction).level
    if (!lvl) return null
    return node.levels[lvl]
  }

  // implementation of the updateEvidence interface function.
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

  // Implementation of the setEvidence interface function.
  setEvidence = (evidence: { [name: string]: string}) => {
    this.removeAllEvidence()
    this.updateEvidence(evidence)
  }

  /** Remove any hard evidence for the given variable.   If the
   * variable has no hard evidence, then the cache will remain
   * unchanged.   Otherwise, all cached values that depend either directly
   * or indirectly on the evidence will be cleared.  NOTE:
   * This could be further improved by using the d-connecteness
   * properties of the nodes;  this is left for future work.
   */
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

  // Remove all evidence from the cache.   Any nodes that depend on
  // hard evidence will be cleared.
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
  private inferFromMarginal (nodeId: NodeId, level: number): number {
    const p = evaluate(this._nodes[nodeId].posteriorMarginal, this._nodes, this._formulas, this._potentials)
    return p[level]
  }

  /** Given a collection of nodes and levels representing an event, construct the
   * joint probability distribution distribution on the given nodes by creating a
   * new potential function that "adds the fill in edges" between the cliques
   * that contain the nodes.   This is expensive, and should be cached to avoid
   * expensive recomputation.  This is left as future work.
   */
  private inferFromJointDistribution (nodeIds: NodeId[]): number {
    throw new Error(`Computing the joint distribution of nodes ${nodeIds} is not yet supported.   They are in different cliques of the junction tree`)
  }

  /** Given a collection of nodes and levels representing an event, and a clique
   * which contains all the given nodes, compute the joint probability of the event
   * by totalizing all the corresponding rows in the cliques posterior marginal
   * potential function.
   */
  private inferFromClique (nodeIds: NodeId[], levels: number[], cliqueId: CliqueId) {
    const clique = this._cliques[cliqueId]
    const formulaId = clique.posterior
    const formula = this._formulas[formulaId]
    const idxs = nodeIds.map(id => formula.domain.findIndex(x => x === id))
    const potential = evaluate(formulaId, this._nodes, this._formulas, this._potentials)
    let total = 0
    potential.forEach((p, i) => {
      const combos = indexToCombination(i, formula.numberOfLevels)
      if (idxs.every((idx, j) => combos[idx] === levels[j])) total += p
    })
    return total
  }

  // Implementation of the infer interface function.  This function
  // lazily evaluates the requested potential.
  infer = (event: { [name: string]: string}) => {
    const names = Object.keys(event)
    // If the empty event has been provided, then the probability is
    // trivially equal to unity.
    if (names.length === 0) return 1

    // If some names have been provided, then we need to find out
    // which nodes they belong to.
    const idxs = names.map(name => this._nodes.findIndex(node => node.name === name))

    // If there are some names that were provided that do not belong to
    // any nodes, then the probability of the event is 0.
    if (idxs.some(idx => idx === -1)) return 0

    // If we reached here, all the names are actually variables/nodes in the
    // Bayes network.   We need to check that all the provided levels are
    // valid outcomes for each variable.
    const levels: number[] = names.map((name, i) => this._nodes[idxs[i]].levels.findIndex(lvl => lvl === event[name]))

    // In the case where any of the levels that were provided are not valid
    // outcomes for the corresponding variable, then the probability
    // is exactly zero.
    if (levels.some(lvl => lvl === -1)) return 0

    // If we reached here, then all the names and levels are valid.
    // If only one name has been provided, then we are tasked with inferring
    // the marginal probability for the event.
    if (idxs.length === 1) return this.inferFromMarginal(idxs[0], levels[0])

    // Otherwise, we are being tasked with finding the joint probability
    // distribution of the event.   In the case where all the variables
    // are in the same clique, then this can be done with the information
    // that already exists in the junction tree.
    const cs = this._cliques.filter(clique => idxs.every(idx => clique.domain.includes(idx))).sort((a, b) => a.domain.length - b.domain.length)
    if (cs.length > 0) return this.inferFromClique(idxs, levels, cs[0].id)

    // Otherwise, we must construct the joint probability distribution
    // by forcing all the variables into a single clique.
    // This is left for future work
    return this.inferFromJointDistribution(idxs)
  }

  inferAll = (options?: IInferAllOptions) => {
    const result: INetworkResult = {}
    this._nodes.forEach(fastnode => {
      result[fastnode.name] = {}
      fastnode.levels.forEach(level => {
        const event: { [level: string]: string} = {}
        event[fastnode.name] = level
        const p = this.infer(event)
        if (options && options.precision != null && options.precision > 0) {
          result[fastnode.name][level] = roundTo(p, options.precision)
        } else {
          result[fastnode.name][level] = p
        }
      })
    })
    return result
  }

  // This is a back door for obtaining all the private collections in the inference engine.
  // This function has been provided to aid in writing additonal tests and for persisting
  // inference engines across instances.
  toJSON = () => clone({
    _class: 'LazyCautiousInferenceEngine',
    _cliques: this._cliques,
    _nodes: this._nodes,
    _potentials: this._potentials,
    _formulas: this._formulas,
    _connectedComponents: this._connectedComponents,
    _separators: this._separators,
    _separatorPotentials: this._separatorPotentials,
  })
}
