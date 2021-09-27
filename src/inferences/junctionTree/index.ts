import {
  IClique,
  ICliquePotentials,
  ICombinations,
  IInfer,
  INetwork,
} from '../../types'
import {
  filterCliquePotentialsByNodeCombinations,
  filterCliquesByNodeCombinations,
  getCliqueWithLessNodes,
  mapPotentialsThen,
} from '../../utils'

import createCliques from './create-cliques'
import getCliquesPotentials from './get-cliques-potentials'
import { sum } from 'ramda'
import { getConnectedComponents } from '../../utils/connected-components'

const getResult = (cliques: IClique[], cliquesPotentials: ICliquePotentials, nodes: ICombinations) => {
  const cliquesNode = filterCliquesByNodeCombinations(cliques, nodes)
  const clique = getCliqueWithLessNodes(cliquesNode)
  const potentials = cliquesPotentials[clique.id]
  const potentialsFiltered = filterCliquePotentialsByNodeCombinations(potentials, nodes)
  const thens = mapPotentialsThen(potentialsFiltered)

  return sum(thens)
}

export const infer: IInfer = (network: INetwork, nodes: ICombinations, given: ICombinations = {}): number => {
  const { cliques, sepSets, junctionTree } = createCliques(network)
  const connectedComponents = getConnectedComponents(junctionTree)
  const roots = connectedComponents.map(x => x[0])
  const cliquesPotentials = getCliquesPotentials(cliques, network, junctionTree, sepSets, given, roots)

  return getResult(cliques, cliquesPotentials, nodes)
}
