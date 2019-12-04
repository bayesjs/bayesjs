import { INetwork, IGraph } from '../types'
import { createGraph } from './graph'
import { networkToNodeList } from '../utils'

export const buildMoralGraph = (network: INetwork): IGraph => {
  const nodes = networkToNodeList(network)
  const moralGraph = createGraph(network)

  for (const node of nodes) {
    for (let i = 0; i < node.parents.length; i++) {
      for (let j = i + 1; j < node.parents.length; j++) {
        if (!moralGraph.areConnected(node.parents[i], node.parents[j])) {
          moralGraph.addEdge(node.parents[i], node.parents[j])
        }
      }
    }
  }

  return moralGraph
}
