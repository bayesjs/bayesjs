import {
  IClique,
  IGraph,
  INetwork,
  ISepSet,
} from '../../types'
import {
  buildJunctionTree,
  buildMoralGraph,
  buildTriangulatedGraph,
} from '../../graphs'

import { buildCliqueGraph } from '../../graphs/cliqueGraph'
import { isNil } from 'ramda'

interface ICreateCliquesResult {
  cliques: IClique[];
  sepSets: ISepSet[];
  junctionTree: IGraph;
}

const createCliquesWeakMap = new WeakMap<INetwork, ICreateCliquesResult>()

export default (network: INetwork): ICreateCliquesResult => {
  const cached = createCliquesWeakMap.get(network)

  if (isNil(cached)) {
    const moralGraph = buildMoralGraph(network)
    const triangulatedGraph = buildTriangulatedGraph(moralGraph)
    const { cliqueGraph, cliques, sepSets } = buildCliqueGraph(triangulatedGraph)
    const junctionTree = buildJunctionTree(cliqueGraph, cliques, sepSets)
    const result = { cliques, sepSets, junctionTree }

    createCliquesWeakMap.set(network, result)

    return result
  }

  return cached
}
