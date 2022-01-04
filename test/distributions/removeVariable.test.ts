import * as expect from 'expect'

import { network } from '../../models/huge-network'
import { InferenceEngine } from '../../src/index'
import { difference } from 'ramda'

const engine = new InferenceEngine(network)

describe('removeVariable', () => {
  it('removes the named variable if it exists', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    const expected = difference(dist.getHeadVariables().map(x => x.name), ['node12'])
    dist.removeVariable('node12')
    const observed = dist.getHeadVariables().map(x => x.name)
    expect(observed).toEqual(expected)
  })
  it('does nothing if the named variable does not exist', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    const expected = dist.getHeadVariables().map(x => x.name)
    dist.removeVariable('foo')
    const observed = dist.getHeadVariables().map(x => x.name)
    expect(observed).toEqual(expected)
  })
  it('Reduces the number of head variables if the variable is a head variable', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    const expected = dist.toJSON().numberOfHeadVariables - 1
    dist.removeVariable('node12')
    const observed = dist.toJSON().numberOfHeadVariables
    expect(observed).toEqual(expected)
  })
  it('Does not change the number of head variables if the variable is a parent', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    const expected = dist.toJSON().numberOfHeadVariables
    dist.removeVariable('node2')
    const observed = dist.toJSON().numberOfHeadVariables
    expect(observed).toEqual(expected)
  })
  it('removes the correct number of elements from the potential function', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    const expected = dist.toJSON().potentialFunction.length / 2
    dist.removeVariable('node12')
    const observed = dist.toJSON().potentialFunction.length
    expect(observed).toEqual(expected)
  })
})
