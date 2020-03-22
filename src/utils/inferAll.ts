import { ICombinations, INetwork, INetworkResult, INode, INodeResult } from '../types'
import { assoc, propEq, reduce } from 'ramda'
import { getNodeStates, getNodesFromNetwork } from './network'

import { infer } from '../inferences/junctionTree'
import { propIsNotNil } from './fp'

const inferNodeState = (network: INetwork, nodeId: string, nodeState: string, given: ICombinations) => {
  if (propIsNotNil(nodeId, given)) {
    return propEq(nodeId, nodeState, given) ? 1 : 0
  }

  return infer(network, { [nodeId]: nodeState }, given)
}

const inferNode = (network: INetwork, node: INode, given: ICombinations) =>
  reduce(
    (acc, nodeState) => assoc(
      nodeState,
      inferNodeState(network, node.id, nodeState, given),
      acc,
    ),
    {} as INodeResult,
    getNodeStates(node),
  )

export const inferAll = (network: INetwork, given: ICombinations = {}): INetworkResult =>
  reduce(
    (acc, node) => assoc(node.id, inferNode(network, node, given), acc),
    {} as INetworkResult,
    getNodesFromNetwork(network),
  )
