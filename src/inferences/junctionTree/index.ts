import {
  IClique,
  ICliquePotentialItem,
  ICombinations,
  IGraph,
  IInfer,
  INetwork,
  ISepSet,
  IStorage,
  IWeakStorage,
} from '../../types'
import { createStorage, createWeakStorage } from '../../utils'
import {
  divide,
  head,
  isNil,
  minBy,
  reduce,
  sum,
  tail,
} from 'ramda'

import { createCliques } from './create-cliques'
import { globalPropagation } from './global-propagation'
import { initializePotentials } from './initialize-potentials'

const wmKey = new WeakMap()
const map = new Map()

const checkPotentialByNodes = (potential: ICliquePotentialItem, nodes: ICombinations): boolean => {
  const { when } = potential
  const whenNodeIds = Object.keys(when)

  return whenNodeIds.every(whenNodeId => {
    const whenValue = when[whenNodeId]
    const nodeValue = nodes[whenNodeId]

    return isNil(nodeValue) || whenValue === nodeValue
  })
}

const filterPotentialsByNodes = (potentials: ICliquePotentialItem[], nodes: ICombinations): ICliquePotentialItem[] => potentials.reduce((acc, potential) =>
  checkPotentialByNodes(potential, nodes) ? [...acc, potential] : acc
, [] as ICliquePotentialItem[])

const filterCliquesByNodes = (cliques: IClique[], nodes: ICombinations = {}) => {
  const nodesToInfer = Object.keys(nodes)

  return cliques.filter(clique =>
    clique.nodeIds.some(nodeId =>
      nodesToInfer.some(nodeToInfer =>
        nodeId === nodeToInfer,
      ),
    ),
  )
}

const getMinimalCliqueLength = (cliques: IClique[]) => {
  const min = minBy<IClique>(({ nodeIds }) => nodeIds.length)

  return reduce(min, head(cliques)!, tail(cliques))
}

const getResult = (cliques: IClique[], nodes: ICombinations = {}) => {
  const cliquesNode = filterCliquesByNodes(cliques, nodes)
  const clique = getMinimalCliqueLength(cliquesNode)!
  const potentialsFiltred = filterPotentialsByNodes(clique.potentials!, nodes)
    .map(x => x.then)

  return sum(potentialsFiltred)
}

const getKeyNetwork = (storage: IWeakStorage<INetwork, string>, network: INetwork) => storage.getOrStore(
  network,
  () => {
    const obj = Object.keys(network)
      .reduce((p, nodeId) => {
        const { id, parents, states, cpt } = network[nodeId]
        p[id] = { id, parents, states, cpt }
        return p
      }, {} as INetwork)

    return JSON.stringify(obj)
  },
)

const getKeyGiven = (given: ICombinations) => {
  const keys = Object.keys(given)

  if (keys.length) {
    return keys.map(nodeId => ({ nodeId, state: given[nodeId] }))
      .reduce((str, { nodeId, state }) => `${str}-${nodeId}-${state}`, '')
  }

  return 'NO GIVEN'
}

const normalizePotentials = (potentials: ICliquePotentialItem[] = []) => {
  const thens = potentials.map(({ then }) => then)
  const total = sum(thens)
  const isZero = total === 0

  if (isZero) {
    return potentials
  } else {
    return potentials.map(({ when, then }) => ({
      when,
      then: divide(then, total),
    }))
  }
}

const normalizeCliques = (cliques: IClique[]): IClique[] => cliques.map(({ id, potentials, nodeIds }) => ({
  id,
  nodeIds,
  potentials: normalizePotentials(potentials),
}))

const propagationCliques = (storage: IStorage<string, IClique[]>, cliques: IClique[], network: INetwork, junctionTree: IGraph, sepSets: ISepSet[], given: ICombinations = {}) => {
  const key = getKeyGiven(given)

  return storage.getOrStore(
    key,
    () => {
      initializePotentials(cliques, network, given)
      globalPropagation(network, junctionTree, cliques, sepSets)

      return normalizeCliques(cliques)
    },
  )
}

export const infer: IInfer = (network: INetwork, nodes: ICombinations, given?: ICombinations): number => {
  const storage = createStorage(map)
  const weakStorage = createWeakStorage(wmKey)
  const key = getKeyNetwork(weakStorage, network)
  const cliqueInfos = storage.getOrStore(
    key,
    () => {
      if (storage.clear) storage.clear()
      return createCliques(network)
    },
  )
  const { emptyCliques, sepSets, junctionTree } = cliqueInfos
  const cliques = propagationCliques(storage, emptyCliques, network, junctionTree, sepSets, given)

  // TODO: considerar P(A,B,C), por enquanto só P(A)
  return getResult(cliques, nodes)
}
