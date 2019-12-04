import { ICombinations, INetwork } from '../types'

const makeCombinations = (network: INetwork, nodesToCombine: string[]) => {
  const combinations: ICombinations[] = []

  const combine = (nodes: string[], acc = {}) => {
    if (nodes.length === 0) {
      combinations.push(acc)
    } else {
      const [nodeId, ...rest] = nodes
      const { states } = network[nodeId]

      for (const state of states) {
        combine(rest, {
          ...acc,
          [nodeId]: state,
        })
      }
    }
  }

  combine(nodesToCombine)

  return combinations
}

export const buildCombinations = (network: INetwork, nodesToCombine?: string[]): ICombinations[] => {
  const nodeIds = nodesToCombine || Object.keys(network)

  return makeCombinations(network, nodeIds)
}
