import {
  INetwork,
  INode,
  INodeList,
} from '../types'

import { addNode } from '..'
import { isNil } from 'lodash'

export const networkToNodeList = (network: INetwork): INodeList => {
  const nodeIds = Object.keys(network)

  return nodeIds.reduce((list, nodeIs) => ([...list, network[nodeIs]]), [] as INode[])
}

const everyInArray = (array1: string[], array2: string[]) => array1.every(parent => array2.indexOf(parent) !== -1)

const getNext = (oNodes: INodeList) => {
  const nodes = [...oNodes].sort((a, b) => a.parents.length - b.parents.length)
  const nodesGiven: string[] = []

  return () => {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      const noParents = node.parents.length === 0

      if (noParents || everyInArray(node.parents, nodesGiven)) {
        nodesGiven.push(node.id)
        nodes.splice(i, 1)
        return node
      }
    }
  }
}

export const createNetwork = (...nodes: INode[]): INetwork => {
  const next = getNext(nodes)

  return nodes.reduce((net) => {
    const node = next()

    if (isNil(node)) return net

    return { ...addNode(net, node) }
  }, {})
}
