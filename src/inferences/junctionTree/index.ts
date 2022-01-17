import {
  ICombinations,
  IInfer,
  INetwork,
  ICptWithParents,
  ICptWithoutParents,
} from '../../types'

import { LazyPropagationEngine } from '../../engines'

export const infer: IInfer = (network: INetwork, nodes: ICombinations, given: ICombinations = {}): number => {
  const net: { [name: string]: { levels: string[]; parents: string[]; cpt?: ICptWithParents | ICptWithoutParents}} = {}
  Object.values(network).forEach(node => {
    net[node.id] = {
      levels: node.states,
      parents: node.parents,
      cpt: node.cpt,
    }
  })
  const engine = new LazyPropagationEngine(net)
  const evidence: {[name: string]: [string]} = {}
  Object.entries(given).forEach(([name, level]) => { evidence[name] = [level] })
  engine.setEvidence(evidence)
  const event: {[name: string]: string[]} = {}
  Object.entries(nodes).forEach(([name, level]) => { event[name] = [level] })
  return engine.infer(event)
}
