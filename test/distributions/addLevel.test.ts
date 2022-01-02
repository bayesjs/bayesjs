import * as expect from 'expect'

import { allNodes } from '../../models/huge-network'
import { createNetwork } from '../../src/utils'
import { InferenceEngine } from '../../src/index'

const network = createNetwork(...allNodes)
const engine = new InferenceEngine(network)

describe('addLevel', () => {
  it('adds the correct level name', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    const expected = ['T', 'F', '?']
    dist.addLevel('node12', '?')
    const observed = dist.getHeadVariable('node12').levels
    expect(observed).toEqual(expected)
  })
  it('adds the correct number of elements to the potential function', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    const expected = dist.toJSON().potentialFunction.length / 2 * 3
    dist.addLevel('node12', '?')
    const observed = dist.toJSON().potentialFunction.length
    expect(observed).toEqual(expected)
  })
  it('followed by remove level recovers the original distribution', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    const expected = [...dist.toJSON().potentialFunction]
    dist.addLevel('node12', '?')
    dist.removeLevel('node12', '?')
    const observed = [...dist.toJSON().potentialFunction]
    expect(observed.map(x => x.toPrecision(8))).toEqual(expected.map(x => x.toPrecision(8)))
  })
})
