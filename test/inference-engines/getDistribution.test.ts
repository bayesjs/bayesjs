import * as expect from 'expect'

import { allNodes } from '../../models/huge-network'
import { createNetwork } from '../../src/utils'
import { InferenceEngine } from '../../src/index'

describe('getDistribution', () => {
  it('round trip is faithful', () => {
    const network = createNetwork(...allNodes)
    const engine = new InferenceEngine(network)
    const name = 'node25'
    const observed = engine.getDistribution(name)
    const expected = allNodes.find(x => x.id === name)?.cpt
    expect(observed).toEqual(expected)
  })
})
