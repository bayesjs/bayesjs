import {
  IClique,
  ICombinations,
  IGraph,
  INetwork,
  ISepSet,
} from '../../types'
import { normalizeCliquePotentials } from '../../utils'

import createInitialPotentials from './create-initial-potentials'
import propagatePotential from './propagate-potentials'

export default (cliques: IClique[], network: INetwork, junctionTree: IGraph, sepSets: ISepSet[], given: ICombinations, roots: string[]) => {
  const cliquesPotentials = createInitialPotentials(cliques, network, given)
  const finalCliquesPotentials = propagatePotential(network, junctionTree, cliques, sepSets, cliquesPotentials, roots)
  const result = normalizeCliquePotentials(finalCliquesPotentials)
  return result
}
