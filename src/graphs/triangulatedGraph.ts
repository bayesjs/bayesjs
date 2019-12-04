import { IGraph } from '../types'
import { minBy } from 'lodash'

const findLessNeighborsMaker = (graph: IGraph, nodesToRemove: string[]) => (): string => {
  if (nodesToRemove.length === 1) return nodesToRemove.shift()!

  const nodeId = minBy(nodesToRemove, node => graph.getNeighborsOf(node).length)!
  const nodeIdIndex = nodesToRemove.indexOf(nodeId)

  nodesToRemove.splice(nodeIdIndex, 1)
  return nodeId
}

export const buildTriangulatedGraph = (moralGraph: IGraph) => {
  const triangulatedGraph = moralGraph.clone()
  const clonedGraph = triangulatedGraph.clone()
  const nodesToRemove = [...clonedGraph.getNodesId()]
  const findLessNeighbors = findLessNeighborsMaker(triangulatedGraph, nodesToRemove)

  while (nodesToRemove.length > 0) {
    const nodeToRemove = findLessNeighbors()
    const neighbors = clonedGraph.getNeighborsOf(nodeToRemove)
      .filter(id => nodesToRemove.indexOf(id) > -1)

    for (let i = 0; i < neighbors.length; i++) {
      const neighborA = neighbors[i]

      for (let j = i + 1; j < neighbors.length; j++) {
        const neighborB = neighbors[j]

        if (!clonedGraph.containsNodeId(neighborA) || !clonedGraph.containsNodeId(neighborB)) {
          continue
        }

        if (!clonedGraph.areConnected(neighborA, neighborB)) {
          clonedGraph.addEdge(neighborA, neighborB)
          triangulatedGraph.addEdge(neighborA, neighborB)
        }
      }
    }

    clonedGraph.removeNodeId(nodeToRemove)
  }

  return triangulatedGraph
}
