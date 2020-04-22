import { IClique, ICliqueGraph, IGraph } from '../types'
import { addIndex, any, drop, forEach, includes } from 'ramda'

import { createCliques } from '../utils/create-cliques'
import { createGraphBuilder } from './builder'

const forEachIndexed = addIndex<IClique>(forEach)

const hasConnectionBetweenCliques = (cliqueA: IClique, cliqueB: IClique) => any(
  (nodeId) => includes(nodeId, cliqueB.nodeIds),
  cliqueA.nodeIds,
)

export const createCliqueGraph = (triangulatedGraph: IGraph): ICliqueGraph => {
  const cliques = createCliques(triangulatedGraph)
  const cliqueGraph = createGraphBuilder()

  forEachIndexed(
    (cliqueA, index) => {
      const nextCliques = drop(index + 1, cliques)

      cliqueGraph.addNodeId(cliqueA.id)

      forEach(
        cliqueB => {
          if (hasConnectionBetweenCliques(cliqueA, cliqueB)) {
            cliqueGraph.addEdge(cliqueA.id, cliqueB.id)
          }
        },
        nextCliques,
      )
    },
    cliques,
  )

  return {
    graph: cliqueGraph,
    cliques,
  }
}
