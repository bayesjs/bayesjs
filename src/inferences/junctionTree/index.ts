import {
  ICombinations,
  IInfer,
  INetwork,
} from '../../types'

import { LazyPropagationEngine } from '../../engines'

export const infer: IInfer = (network: INetwork, nodes: ICombinations, given: ICombinations = {}): number => {
  const engine = new LazyPropagationEngine(network)
  engine.setEvidence(given)
  return engine.infer(nodes)
}
