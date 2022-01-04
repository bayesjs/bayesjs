import {
  ICombinations,
  IInfer,
  INetwork,
} from '../../types'

import { LazyPropagationEngine, Distribution, fromCPT } from '../../engines'

export const infer: IInfer = (network: INetwork, nodes: ICombinations, given: ICombinations = {}): number => {
  const net: { [name: string]: { levels: string[]; parents: string[]; distribution?: Distribution}} = {}
  Object.values(network).forEach(node => {
    net[node.id] = {
      levels: node.states,
      parents: node.parents,
      distribution: fromCPT(node.id, node.cpt),
    }
  })
  const engine = new LazyPropagationEngine(net)
  engine.setEvidence(given)
  return engine.infer(nodes)
}
