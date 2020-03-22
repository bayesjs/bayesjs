import { ICombinations, IInferAllOptions, INetwork, INetworkResult, INode, INodeResult } from '../types'
import { assoc, clone, identity, ifElse, nthArg, pipe, propEq, reduce } from 'ramda'
import { getNodeStates, getNodesFromNetwork } from './network'

import { infer } from '../inferences/junctionTree'
import { propIsNotNil } from './fp'

const defaultOptions: IInferAllOptions = {
  force: false,
}

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

const cloneIfForce: <T>(network: T, options: IInferAllOptions) => T = ifElse(
  pipe(nthArg(1), propEq('force', true)),
  clone,
  identity,
)

export const inferAll = (network: INetwork, given: ICombinations = {}, options: IInferAllOptions = defaultOptions): INetworkResult => {
  const networkToInfer = cloneIfForce(network, options)
  const givenToInfer = cloneIfForce(given, options)

  return reduce(
    (acc, node) => assoc(node.id, inferNode(networkToInfer, node, givenToInfer), acc),
    {} as INetworkResult,
    getNodesFromNetwork(network),
  )
}
