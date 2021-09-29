import { IInferenceEngine, ISepSet, INode, INetworkResult, IInferAllOptions, ICptWithParents, ICptWithoutParents, INetwork, ICombinations, ICliquePotentials, IClique, IGraph, INodeResult } from '../../types'
import createCliques from '../inferences/junctionTree/create-cliques'
import createInitialPotentials from '../inferences/junctionTree/create-initial-potentials'
import propagatePotentials from '../inferences/junctionTree/propagate-potentials'
import { filterCliquePotentialsByNodeCombinations, filterCliquesByNodeCombinations, getCliqueWithLessNodes, getNodesFromNetwork, getNodeStates, mapPotentialsThen, normalizeCliquePotentials, propIsNotNil } from '../../utils'
import { clone, propEq, sum } from 'ramda'
import { getConnectedComponents } from '../utils/connected-components'
import roundTo = require('round-to')

class EvidenceFunction {
  private _name: string
  private _value: string

  constructor (network: INetwork, name: string, level: string) {
    const err = (reason: string) => { throw new Error(`Cannot construct evidence function.  ${reason}.`) }

    const node: INode | null = network[name]
    if (node == null) err(`Bayes network does not have node ${name}`)

    if (!node.states.includes[level]) err(`Variable ${name} does not have the levels: ${level}`)

    this._value = level
    this._name = name
  }
}

// This class implements the IInferenceEngine interface using the
// lazy cautious algorithm for propagation of evidence described in
// https://arxiv.org/pdf/1301.7398.pdf.   It internally
// caches the junction tree structure, clique and potentials,
// evidence and finding functions, and marginal distributions to
// speed up repeated queries with the same evidence.
// Furthermore it uses the d-connectedness of cliques to identify barren
// variables to further speed up propagation.
export class LazyInferenceEngine implements IInferenceEngine {
  // internal caches of bayes net structure.  Note: The topology
  // of the Bayes network should not be able to be modified by
  // any action once the engine has been instanciated.
  private _network: INetwork;
  private _connectedComponents: string[][];
  private _cliques: IClique[];
  private _sepSets: ISepSet[];
  private _junctionTree: IGraph;

  // Caches of potentials and marginals.  These must be reset any
  // time that there are changes to the evidence, or CPT for the
  // network's variables.
  private _potentials: { [source: string]: {
    factors: ICliquePotentials;
    evidence: EvidenceFunction[];
  };} = {};

  private _separatorPotentials: { [source: string]: ICliquePotentials };
  private _marginals: INetworkResult = {};

  // Internal store of the current evidence for the engine.
  // This can only be mutated by the provided functions.
  private _evidence: ICombinations = {}

  // The constructor instanciates all the internally cached information
  // about the bayes network structure and initiallzes the evidence to
  // void.
  constructor (network: INetwork) {
    this._network = clone(network) // note that cloning here is required to prevent external mutation of the network.
    this._evidence = {}
    const { cliques, sepSets, junctionTree } = createCliques(network)
    this._connectedComponents = getConnectedComponents(junctionTree)
    this._cliques = cliques
    this._sepSets = sepSets
    this._junctionTree = junctionTree
  }

  // A helper method for resetting the cached potentials and marginals.
  private resetCache = () => {
    this._potentials = {}
    this._marginals = {}
  }

  // Implementation of various member functions
  hasVariable = (name: string) => this._network[name] != null;
  getVariables = () => Object.keys(this._network);

  hasLevel = (name: string, level: string) => {
    if (!this._network[name]) return false
    const found = this._network[name].states.filter(x => x === level)
    return found !== []
  }

  getLevels = (name: string) => {
    if (!this._network[name]) return []
    return [...this._network[name].states]
  }

  hasParent = (name: string, parent: string) => {
    if (!this._network[name]) return false
    const found = this._network[name].parents.filter(x => x === parent)
    return found !== []
  }

  getParents = (name: string) => {
    if (!this._network[name]) return []
    return [...this._network[name].parents]
  }

  // NOTE: in order to prevent external mutation of the CPT, the
  // result is cloned prior to returning it.
  getDistribution = (name: string) => clone(this._network[name].cpt)

  // NOTE: in order to prevent external mutation of the CPT, the
  // input is cloned prior to assigining to the internally cached value.
  setDistribution = (name: string, cpt: ICptWithParents | ICptWithoutParents) => {
    const node: INode = this._network[name]
    const expectedLevels = node.states
    const expectedParents = node.parents

    // Perform some sanity checks.
    const err = (reason: string) => {
      throw new Error(`Cannot set the distribution for ${name}.  ${reason}.`)
    }
    if (!node) err('The variable does not exist in the network')

    const observedLevels = Array.isArray(cpt)
      ? cpt.length > 0
        ? Object.keys(cpt[0].then)
        : []
      : Object.keys(cpt).sort()

    const observedParents = Array.isArray(cpt)
      ? cpt.length > 0
        ? Object.keys(cpt[0].when)
        : []
      : []

    const hasCorrectLevels: boolean = observedLevels.every(x => expectedLevels.includes(x)) && expectedLevels.every(x => observedLevels.includes(x))
    const hasCorrectParents: boolean = observedParents.every(x => expectedParents.includes(x)) && observedParents.every(x => expectedParents.includes(x))
    if (!hasCorrectLevels) err('The provided distribution did not have the expected levels')
    if (!hasCorrectParents) err('The provided distribution did not have the expected parents')

    // Passed the sanity checks.   reset the cache and set the (cloned) value.
    this.resetCache()
    this._network[name].cpt = clone(cpt)
  }

  // Get the clique potentials.   If the internal cache is not empty, then
  // return the cached values, otherwise, compute them with the current
  // evidence
  private getCliquesPotentials: () => ICliquePotentials = () => {
    if (Object.keys(this._potentials).length === 0) {
      const initialPotentials = createInitialPotentials(this._cliques, this._network, this._evidence)
      const propagatedPotentials = propagatePotentials(this._network, this._junctionTree, this._cliques, this._sepSets, initialPotentials, this._connectedComponents.map(x => x[0]))
      this._potentials = normalizeCliquePotentials(propagatedPotentials)
    }
    return this._potentials
  }

  hasEvidenceFor = (name: string) => this._evidence[name] != null;

  setEvidence = (evidence: { [name: string]: string }) => {
    this.removeAllEvidence()
    this.updateEvidence(evidence)
  }

  updateEvidence = (evidence: { [name: string]: string }) => {
    for (const [name, value] of Object.entries(evidence)) {
      const oldValue = this._evidence[name]
      if (oldValue == null || oldValue !== value) {
        this.resetCache()
      }
      this._evidence[name] = value
    }
  }

  removeEvidence = (name: string) => {
    const oldValue = this._evidence[name]
    if (oldValue != null) {
      this.resetCache()
      delete this._evidence[name]
    }
  }

  removeAllEvidence = () => {
    if (Object.keys(this._evidence).length > 0) {
      this.resetCache()
      this._evidence = {}
    }
  }

  infer = (event: ICombinations) => {
    const cliquesPotentials = this.getCliquesPotentials()
    const cliquesNode = filterCliquesByNodeCombinations(this._cliques, event)
    const clique = getCliqueWithLessNodes(cliquesNode)
    const potentials = cliquesPotentials[clique.id]
    const potentialsFiltered = filterCliquePotentialsByNodeCombinations(potentials, event)
    const thens = mapPotentialsThen(potentialsFiltered)

    return sum(thens)
  }

  inferAll = (options?: IInferAllOptions) => {
    const given = this._evidence
    const network = this._network
    if (Object.keys(this._marginals).length === 0) {
      // There are no previously computed marginals for the current
      // evidence.   Compute and cache them.
      for (const node of getNodesFromNetwork(network)) {
        const marginal: INodeResult = {}
        const nodeId = node.id
        for (const state of getNodeStates(node)) {
          if (propIsNotNil(nodeId, given)) {
            marginal[state] = propEq(nodeId, state, given) ? 1 : 0
          } else {
            marginal[state] = this.infer({ [nodeId]: state })
          }
        }
        this._marginals[node.id] = marginal
      }
    }
    // If a precision option has been provided, then format the
    // result to the desired precision
    if (options && options.precision != null && options.precision > 0) {
      const marginals = clone(this._marginals)
      for (const nodeId of Object.keys(marginals)) {
        const marginal = marginals[nodeId]
        for (const k of Object.keys(marginal)) {
          marginal[k] = roundTo(marginal[k], options.precision)
        }
      }
      return marginals
    } else {
      // If the precision has not been provided, then return a clone
      // of the cached marginals.   Cloning ensures that the cached
      // marginals cannot be mutated externally.
      return clone(this._marginals)
    }
  }
}
