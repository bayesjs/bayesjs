import { addIndex, drop, filter, forEach, head, minBy, reduce, tail } from 'ramda'

import { IGraph, INode } from '../types'
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

/** * Given a graph, find the simplicial nodes of that graph.   A simplicial node has
 * neighbors that are all connected to each other.   Simplicial nodes can safely be
 * removed from the remainder graph prior to adding arcs during triangularization
 */
const findSimplicialNodes = (graph: IGraph) => {
  const isSimplicial = (node: INode): boolean => {
    const neighbors = graph.getNodeEdges(node.id)
    let result = true

    for (let i = 0; i < neighbors.length - 1 && result; i++) {
      const neighborA = neighbors[i]
      const nextNeighbors = drop(i + 1, neighbors)
      result = nextNeighbors.every(neighborB => graph.hasEdge(neighborA, neighborB) || graph.hasEdge(neighborB, neighborA))
    }
    return result
  }

  return graph.getNodes().filter(x => isSimplicial(x)).map(x => x.id)
}

export const createTriangulatedGraph = (moralGraph: IGraph) => {
  const triangulatedGraph = moralGraph.clone()
  const clonedGraph = triangulatedGraph.clone()

  // Find and remove the simplicial nodes from the remainder graph
  const simplicialNodes = findSimplicialNodes(clonedGraph)
  simplicialNodes.forEach(nodeId => clonedGraph.removeNodeId(nodeId))

  const nodeIds = getNodeIdsSorted(clonedGraph)

  // Traverse the queue, adding the fill edges as required.
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
