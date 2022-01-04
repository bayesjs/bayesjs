import * as expect from 'expect'

import { network } from '../../models/huge-network'
import { InferenceEngine } from '../../src/index'

const engine = new InferenceEngine(network)

describe('renameLevel', () => {
  it("doesn't change the potential function", () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    const expected = [...dist.toJSON().potentialFunction]
    dist.renameLevel('node12', 'T', 'true')
    dist.renameLevel('node2', 'T', 'true')
    const observed = dist.toJSON().potentialFunction
    expect(observed).toEqual(expected)
  })
  it('renames a level of a head variable', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    dist.renameLevel('node12', 'T', 'true')
    const observed = dist.getHeadVariable('node12').levels
    expect(observed).toEqual(['true', 'F'])
  })
  it('renames a parent variable', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    dist.renameLevel('node2', 'T', 'true')
    const observed = dist.getParentVariable('node2').levels
    expect(observed).toEqual(['true', 'F'])
  })
})
