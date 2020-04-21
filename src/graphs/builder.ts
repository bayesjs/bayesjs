import {
  IEdge,
  IGraph,
  INetwork,
  INode,
} from '../types'
import { any, append, complement, concat, curry, equals, map, pluck, reduce, reject } from 'ramda'

import { getNodesFromNetwork } from '../utils'

const getNodeIds = pluck('id')

const getNodeEdges: (nodes: INode[]) => IEdge[] = reduce(
  (acc, node) => {
    const newEdges = map(
      parentId => [parentId, node.id],
      node.parents,
    )

    return concat(acc, newEdges)
  },
  [] as IEdge[],
)

const createArray = <T>(initialValue: T[] = []) => {
  let array = initialValue

  return {
    getValue: () => array,
    setValue: (values: T[]) => { array = values },
    add: (value: T) => { array = append(value, array) },
    reject: (fn: (value: T) => boolean) => { array = reject(fn, array) },
    any: (fn: (value: T) => boolean) => any(fn, array),
  }
}

const hasNodeIdInEdge = curry((nodeId: string, edge: IEdge) => any(equals(nodeId), edge))
const hasNodeIdsInEdge = curry((nodeIdA: string, nodeIdB: string, edge: IEdge) =>
  equals([nodeIdA, nodeIdB], edge) || equals([nodeIdB, nodeIdA], edge))

export const createGraphBuilder = (network: INetwork = {}): IGraph => {
  const allNodes = getNodesFromNetwork(network)
  const nodeIds = createArray(getNodeIds(allNodes))
  const edges = createArray(getNodeEdges(allNodes))
  const hasEdge = (nodeIdA: string, nodeIdB: string) => edges.any(hasNodeIdsInEdge(nodeIdA, nodeIdB))

  return {
    getNodes: () => allNodes,

    setNodeIds: (newNodeIds: string[]) => nodeIds.setValue(newNodeIds),

    setEdges: (newEdges: IEdge[]) => edges.setValue(newEdges),

    getNodesId: nodeIds.getValue,

    getEdges: edges.getValue,

    addNodeId: (nodeId: string) => nodeIds.add(nodeId),

    removeNodeId: (nodeId: string) => {
      edges.reject(hasNodeIdInEdge(nodeId))
      nodeIds.reject(equals(nodeId))
    },

    hasNodeId: (nodeId: string) => nodeIds.any(equals(nodeId)),

    addEdge: (nodeIdA: string, nodeIdB: string) => edges.add([nodeIdA, nodeIdB]),

    removeEdge: (nodeIdA: string, nodeIdB: string) => {
      edges.reject(hasNodeIdsInEdge(nodeIdA, nodeIdB))
    },

    hasEdge,

    hasNotEdge: complement(hasEdge),

    getNodeEdges: (nodeId: string) =>
      reduce(
        (acc, [nodeIdA, nodeIdB]) => {
          if (equals(nodeId, nodeIdA)) return append(nodeIdB, acc)
          if (equals(nodeId, nodeIdB)) return append(nodeIdA, acc)
          return acc
        },
        [] as string[],
        edges.getValue(),
      ),

    clone: () => {
      const clonedGraph = createGraphBuilder(network)

      clonedGraph.setNodeIds(nodeIds.getValue())
      clonedGraph.setEdges(edges.getValue())

      return clonedGraph
    },
  }
}
