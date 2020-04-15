import {
  INetwork,
  INode,
  INodeList,
} from '../types'
import {
  append,
  complement,
  converge,
  filter,
  isNil,
  map,
  pipe,
  prop,
  values,
} from 'ramda'

import { addNode } from '..'
import { isNotEmpty } from './fp'

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

export const getNodeParents: (node: INode) => string[] = prop('parents')
export const getNodeId: (node: INode) => string = prop('id')
export const getNodeStates: (node: INode) => string[] = prop('states')

export const hasNodeParents: (node: INode) => boolean = pipe(getNodeParents, isNotEmpty)
export const getNodeParentsAndId: (node: INode) => string[] = converge(append, [prop('id'), prop('parents')])
export const hasNotNodeParents: (node: INode) => boolean = complement(hasNodeParents)
export const getNodesFromNetwork: (network: INetwork) => INode[] = values

export const getNodeIdsWithoutParents: (network: INetwork) => string[] = pipe(
  getNodesFromNetwork,
  filter(hasNotNodeParents),
  map(getNodeId),
)
