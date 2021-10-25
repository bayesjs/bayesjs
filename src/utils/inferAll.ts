import * as roundTo from 'round-to'

import { ICombinations, IInferAllOptions, INetwork, INetworkResult, INode, INodeResult } from '../types'
import { assoc, mergeRight, propEq, reduce } from 'ramda'
import { getNodeStates, getNodesFromNetwork } from './network'

import { infer } from '../inferences/junctionTree'
import { propIsNotNil } from './fp'

const defaultOptions: IInferAllOptions = {
  precision: 8,
}

const getOptions = mergeRight(defaultOptions)

const inferNodeState = (network: INetwork, nodeId: string, nodeState: string, given: ICombinations, options: IInferAllOptions) => {
  if (propIsNotNil(nodeId, given)) {
    return propEq(nodeId, nodeState, given) ? 1 : 0
  }
  const precision = options.precision ? options.precision : defaultOptions?.precision || 8

  return roundTo(infer(network, { [nodeId]: nodeState }, given), precision)
}

const inferNode = (network: INetwork, node: INode, given: ICombinations, options: IInferAllOptions) =>
  reduce(
    (acc, nodeState) => assoc(
      nodeState,
      inferNodeState(network, node.id, nodeState, given, options),
      acc,
    ),
    {} as INodeResult,
    getNodeStates(node),
  )

export const inferAll = (network: INetwork, given: ICombinations = {}, options: IInferAllOptions = {}): INetworkResult => {
  const finalOptions = getOptions(options)
  const networkToInfer = network
  const givenToInfer = given

  return reduce(
    (acc, node) => assoc(node.id, inferNode(networkToInfer, node, givenToInfer, finalOptions), acc),
    {} as INetworkResult,
    getNodesFromNetwork(network),
  )
}
