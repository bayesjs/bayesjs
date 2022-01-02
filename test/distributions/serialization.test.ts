import * as expect from 'expect'

import { allNodes } from '../../models/huge-network'
import { createNetwork } from '../../src/utils'
import { InferenceEngine, Distribution } from '../../src/index'

describe('toJSON', () => {
  it('round trip is faithful', () => {
    const network = createNetwork(...allNodes)
    const engine = new InferenceEngine(network)
    const dist: Distribution = engine.getJointDistribution(['node1', 'node12', 'node19'], ['node2', 'node32'])
    const observed = dist.toJSON()
    const heads = observed.variableNames.slice(0, observed.numberOfHeadVariables).map((name, i) => ({ name, levels: observed.variableLevels[i] }))
    const parents = observed.variableNames.slice(observed.numberOfHeadVariables).map((name, i) => ({ name, levels: observed.variableLevels[i] }))
    const dist2 = new Distribution(heads, parents, observed.potentialFunction)
    expect(dist.getHeadVariables()).toEqual(dist2.getHeadVariables())
    expect(dist.getParentVariables()).toEqual(dist2.getParentVariables())
    expect(dist.describe()).toEqual(dist2.describe())
  })
})
