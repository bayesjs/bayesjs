import { addIndex, drop, filter, forEach, head, minBy, reduce, tail } from 'ramda'

import { IGraph } from '../types'
import { isNotEmpty } from '../utils'

const forEachIndexed = addIndex<string>(forEach)

const getNodeWithLessNeighbors = (graph: IGraph, nodeIds: string[]) => {
  const firstNodeId = head(nodeIds)
  const min = minBy<string>(nodeId => graph.getNodeEdges(nodeId).length)

  if (firstNodeId) {
    return reduce(min, firstNodeId, tail(nodeIds))
  }

  throw new Error('There are not node ids available.')
}

const createIterator = (graph: IGraph) => ({
  [Symbol.iterator]: () => {
    const nodeIds = graph.getNodesId()
    const nodeIdsProcessed = new Set()
    const filterNonProcessed = filter(nodeId => !nodeIdsProcessed.has(nodeId))

    return {
      next: () => {
        const validNodeIds = filterNonProcessed(nodeIds)

        if (isNotEmpty(validNodeIds)) {
          const nodeId = getNodeWithLessNeighbors(graph, validNodeIds)

          nodeIdsProcessed.add(nodeId)

          return { done: false, value: nodeId }
        }

        return { done: true, value: '' }
      },
    }
  },
})

const getNodeIdsSorted = (graph: IGraph) => Array.from(createIterator(graph))

export const createTriangulatedGraph = (moralGraph: IGraph) => {
  const triangulatedGraph = moralGraph.clone()
  const clonedGraph = triangulatedGraph.clone()
  const nodeIds = getNodeIdsSorted(clonedGraph)

  forEach(
    nodeId => {
      const neighbors = clonedGraph.getNodeEdges(nodeId)

      forEachIndexed(
        (neighborA, index) => {
          const nextNeighbors = drop(index + 1, neighbors)

          forEach(
            neighborB => {
              if (clonedGraph.hasNodeId(neighborA) && clonedGraph.hasNodeId(neighborB)) {
                if (clonedGraph.hasNotEdge(neighborA, neighborB)) {
                  clonedGraph.addEdge(neighborA, neighborB)
                  triangulatedGraph.addEdge(neighborA, neighborB)
                }
              }
            },
            nextNeighbors,
          )
        },
        neighbors,
      )
      clonedGraph.removeNodeId(nodeId)
    },
    nodeIds,
  )

  return triangulatedGraph
}
