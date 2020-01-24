import {
  buildJunctionTree,
  buildMoralGraph,
  buildTriangulatedGraph,
} from '../../graphs'

import {
  INetwork,
} from '../../types'
import { buildCliqueGraph } from '../../graphs/cliqueGraph'

export const createCliques = (network: INetwork) => {
  const moralGraph = buildMoralGraph(network)
  const triangulatedGraph = buildTriangulatedGraph(moralGraph)
  const { cliqueGraph, cliques, sepSets } = buildCliqueGraph(triangulatedGraph)
  const junctionTree = buildJunctionTree(cliqueGraph, cliques, sepSets)

  return {
    emptyCliques: cliques,
    sepSets,
    junctionTree,
  }
}
