import {
  ICombinations,
  IInfer,
  INetwork,
} from '../../types'

import { HuginInferenceEngine } from './hugin-inference-engine'

export const infer: IInfer = (network: INetwork, nodes: ICombinations, given: ICombinations = {}): number => {
  const engine = new HuginInferenceEngine(network)
  engine.setEvidence(given)
  return engine.infer(nodes)
}
