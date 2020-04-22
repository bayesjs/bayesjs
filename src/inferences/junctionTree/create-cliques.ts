import {
  IClique,
  ICliqueGraph,
  IGraph,
  INetwork,
  ISepSet,
} from '../../types'
import { isNil, pipe } from 'ramda'

import { createCliqueGraph } from '../../graphs/clique'
import { createGraphBuilder } from '../../graphs/builder'
import { createMoralGraph } from '../../graphs/moral'
import { createSepSets } from '../../utils'
import { createTriangulatedGraph } from '../../graphs/triangulated'

interface ICreateCliquesResult {
  cliques: IClique[];
  sepSets: ISepSet[];
  junctionTree: IGraph;
}

const createCliquesWeakMap = new WeakMap<INetwork, ICreateCliquesResult>()

const createCliquesGraph: (graph: IGraph) => ICliqueGraph = pipe(
  createMoralGraph,
  createTriangulatedGraph,
  createCliqueGraph,
)

export default (network: INetwork): ICreateCliquesResult => {
  const cached = createCliquesWeakMap.get(network)

  if (isNil(cached)) {
    const { graph, cliques } = createCliquesGraph(createGraphBuilder(network))
    const sepSets = createSepSets(cliques, graph.removeEdge)
    const result = { cliques, sepSets, junctionTree: graph }

    createCliquesWeakMap.set(network, result)

    return result
  }

  return cached
}
