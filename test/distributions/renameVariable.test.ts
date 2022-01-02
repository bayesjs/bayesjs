import * as expect from 'expect'

import { allNodes } from '../../models/huge-network'
import { createNetwork } from '../../src/utils'
import { InferenceEngine } from '../../src/index'

const network = createNetwork(...allNodes)
const engine = new InferenceEngine(network)

describe('renameVariable', () => {
  it("doesn't change the potential function", () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    const expected = [...dist.toJSON().potentialFunction]
    dist.renameVariable('node12', 'n12')
    dist.renameVariable('node2', 'n2')
    const observed = dist.toJSON().potentialFunction
    expect(observed).toEqual(expected)
  })
  it('renames a head variable', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    dist.renameVariable('node12', 'n12')
    const observed = dist.getHeadVariables().map(x => x.name)
    expect(observed).toEqual(['node1', 'n12', 'node36'])
  })
  it('renames a parent variable', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    dist.renameVariable('node2', 'n2')
    const observed = dist.getParentVariables().map(x => x.name)
    expect(observed).toEqual(['n2', 'node14'])
  })
  it('doesn\'t change the variable\'s levels', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    const expected = [...dist.getParentVariable('node2').levels]
    dist.renameVariable('node2', 'n2')
    const observed = [...dist.getParentVariable('n2').levels]
    expect(observed).toEqual(expected)
  })
})
