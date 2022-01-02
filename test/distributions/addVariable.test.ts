import * as expect from 'expect'

import { allNodes } from '../../models/huge-network'
import { createNetwork } from '../../src/utils'
import { InferenceEngine } from '../../src/index'
import { evaluateMarginalPure } from '../../src/engines/evaluation'

const network = createNetwork(...allNodes)
const engine = new InferenceEngine(network)

describe('addHeadVariable', () => {
  it('increases the number of head variables in the distribution', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    const expected = dist.toJSON().numberOfHeadVariables + 1
    dist.addHeadVariable('foo', ['T', 'F', '?'])
    const observed = dist.toJSON().numberOfHeadVariables
    expect(observed).toEqual(expected)
  })
  it('adds the correct variable name', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    const expected = [...dist.getHeadVariables().map(x => x.name), 'foo']
    dist.addHeadVariable('foo', ['T', 'F', '?'])
    const observed = dist.getHeadVariables().map(x => x.name)
    expect(observed).toEqual(expected)
  })
  it('adds the correct variable levels', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    const expected = ['T', 'F', '?']
    dist.addHeadVariable('foo', ['T', 'F', '?'])
    const observed = dist.getHeadVariable('foo').levels
    expect(observed).toEqual(expected)
  })
  it('adds the correct number of elements to the potential function', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    const expected = dist.toJSON().potentialFunction.length * 3
    dist.addHeadVariable('foo', ['T', 'F', '?'])
    const observed = dist.toJSON().potentialFunction.length
    expect(observed).toEqual(expected)
  })
  it('followed by remove recovers the original distribution', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    const expected = [...dist.toJSON().potentialFunction]
    dist.addHeadVariable('foo', ['T', 'F', '?'])
    dist.removeVariable('foo')
    const observed = [...dist.toJSON().potentialFunction]
    expect(observed.map(x => x.toPrecision(8))).toEqual(expected.map(x => x.toPrecision(8)))
  })
  it('marginal over new variable is uniform distribution', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    dist.addHeadVariable('foo', ['T', 'F', '?'])
    dist.removeVariable('node1')
    dist.removeVariable('node12')
    dist.removeVariable('node36')
    dist.removeVariable('node2')
    dist.removeVariable('node14')
    const observed = [...dist.toJSON().potentialFunction]
    expect(observed.map(x => x.toPrecision(8))).toEqual(['0.33333333', '0.33333333', '0.33333333'])
  })
})
describe('addParentVariable', () => {
  it('does not change the number of head variables in the distribution', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    const expected = dist.toJSON().numberOfHeadVariables
    dist.addParentVariable('foo', ['T', 'F', '?'])
    const observed = dist.toJSON().numberOfHeadVariables
    expect(observed).toEqual(expected)
  })
  it('adds the correct variable name', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    const expected = [...dist.getParentVariables().map(x => x.name), 'foo']
    dist.addParentVariable('foo', ['T', 'F', '?'])
    const observed = dist.getParentVariables().map(x => x.name)
    expect(observed).toEqual(expected)
  })
  it('adds the correct variable levels', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    const expected = ['T', 'F', '?']
    dist.addParentVariable('foo', ['T', 'F', '?'])
    const observed = dist.getParentVariable('foo').levels
    expect(observed).toEqual(expected)
  })
  it('adds the correct number of elements to the potential function', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    const expected = dist.toJSON().potentialFunction.length * 3
    dist.addParentVariable('foo', ['T', 'F', '?'])
    const observed = dist.toJSON().potentialFunction.length
    expect(observed).toEqual(expected)
  })
  it('followed by remove recovers the original distribution', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    const expected = [...dist.toJSON().potentialFunction]
    dist.addParentVariable('foo', ['T', 'F', '?'])
    dist.removeVariable('foo')
    const observed = [...dist.toJSON().potentialFunction]
    expect(observed.map(x => x.toPrecision(8))).toEqual(expected.map(x => x.toPrecision(8)))
  })
  it('marginal over new variable is uniform distribution', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    dist.addParentVariable('foo', ['T', 'F', '?'])
    const potential = dist.toJSON().potentialFunction
    // note: using evaluate marginal here instead of remove, because we can't remove all the
    // head variables from a distribution.
    const observed = evaluateMarginalPure(potential, [0, 1, 2, 3, 4, 5], [2, 2, 2, 2, 2, 3], [5], [3], 3)
    expect(observed.map(x => x.toPrecision(8))).toEqual(['0.33333333', '0.33333333', '0.33333333'])
  })
})
