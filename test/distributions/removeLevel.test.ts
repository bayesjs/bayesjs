import * as expect from 'expect'

import { allNodes } from '../../models/huge-network'
import { createNetwork } from '../../src/utils'
import { InferenceEngine } from '../../src/index'
import { difference } from 'ramda'

const network = createNetwork(...allNodes)
const engine = new InferenceEngine(network)

describe('removeLevel', () => {
  it('removes the level if it exists', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    const expected = difference(dist.getHeadVariable('node12').levels, ['F'])
    dist.removeLevel('node12', 'F')
    const observed = dist.getHeadVariable('node12').levels
    expect(observed).toEqual(expected)
  })
  it('does nothing if the level does not exist', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    const expected = dist.getHeadVariable('node12').levels
    dist.removeLevel('node12', '?')
    const observed = dist.getHeadVariable('node12').levels
    expect(observed).toEqual(expected)
  })
  it('removes the correct number of elements from the potential function', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    const expected = dist.toJSON().potentialFunction.length / 2
    dist.removeLevel('node12', 'F')
    const observed = dist.toJSON().potentialFunction.length
    expect(observed).toEqual(expected)
  })
})
