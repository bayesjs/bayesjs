import {
  IClique,
  ICliquePotentials,
  ICombinations,
  IGraph,
  IInfer,
  INetwork,
  ISepSet,
  IStorage,
  IWeakStorage,
} from '../../types'
import {
  createStorage,
  createWeakStorage,
  filterCliquePotentialsByNodeCombinations,
  filterCliquesByNodeCombinations,
  getCliqueWithLessNodes,
  mapPotentialsThen,
  normalizeCliquePotentials,
} from '../../utils'
import {
  sum,
  toString,
} from 'ramda'

import createCliques from './create-cliques'
import createInitialPotentials from './create-initial-potentials'
import propagatePotential from './propagate-potentials'

const weakMapInstance = new WeakMap()
const mapInstance = new Map()

const getResult = (cliques: IClique[], cliquesPotentials: ICliquePotentials, nodes: ICombinations = {}) => {
  const cliquesNode = filterCliquesByNodeCombinations(cliques, nodes)
  const clique = getCliqueWithLessNodes(cliquesNode)
  const potentials = cliquesPotentials[clique.id]
  const potentialsFiltered = filterCliquePotentialsByNodeCombinations(potentials, nodes)
  const thens = mapPotentialsThen(potentialsFiltered)

  return sum(thens)
}

const getKeyNetwork = (storage: IWeakStorage<INetwork, string>, network: INetwork) => storage.getOrStore(
  network,
  () => toString(network),
)

const propagationCliques = (storage: IStorage<string, ICliquePotentials>, cliques: IClique[], network: INetwork, junctionTree: IGraph, sepSets: ISepSet[], given: ICombinations = {}) => {
  const key = toString(given)

  return storage.getOrStore(
    key,
    () => {
      const cliquesPotentials = createInitialPotentials(cliques, network, given)
      const finalCliquesPotentials = propagatePotential(network, junctionTree, cliques, sepSets, cliquesPotentials)

      return normalizeCliquePotentials(finalCliquesPotentials)
    },
  )
}

export const infer: IInfer = (network: INetwork, nodes: ICombinations, given?: ICombinations): number => {
  const storage = createStorage(mapInstance)
  const weakStorage = createWeakStorage(weakMapInstance)
  const key = getKeyNetwork(weakStorage, network)
  const cliqueInfos = storage.getOrStore(
    key,
    () => {
      if (storage.clear) storage.clear()
      return createCliques(network)
    },
  )
  const { emptyCliques, sepSets, junctionTree } = cliqueInfos
  const cliquesPotentials = propagationCliques(storage, emptyCliques, network, junctionTree, sepSets, given)

  return getResult(emptyCliques, cliquesPotentials, nodes)
}
