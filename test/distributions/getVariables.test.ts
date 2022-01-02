import * as expect from 'expect'

import { allNodes } from '../../models/huge-network'
import { createNetwork } from '../../src/utils'
import { InferenceEngine } from '../../src/index'

const network = createNetwork(...allNodes)
const engine = new InferenceEngine(network)

describe('The constructed distribution', () => {
  it('should have the correct head variables', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    expect(dist.getHeadVariables().map(x => x.name)).toEqual(['node1', 'node12', 'node36'])
    expect(dist.hasHeadVariable('node1')).toEqual(true)
    expect(dist.hasHeadVariable('node12')).toEqual(true)
    expect(dist.hasHeadVariable('node36')).toEqual(true)
    expect(dist.hasHeadVariable('node2')).toEqual(false)
    expect(dist.hasHeadVariable('node14')).toEqual(false)
    expect(dist.hasHeadVariable('node7')).toEqual(false)
  })
  it('should have the correct parent variables', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    expect(dist.getParentVariables().map(x => x.name)).toEqual(['node2', 'node14'])
    expect(dist.hasParentVariable('node1')).toEqual(false)
    expect(dist.hasParentVariable('node12')).toEqual(false)
    expect(dist.hasParentVariable('node36')).toEqual(false)
    expect(dist.hasParentVariable('node2')).toEqual(true)
    expect(dist.hasParentVariable('node14')).toEqual(true)
    expect(dist.hasParentVariable('node7')).toEqual(false)
  })
  it('should have correct levels for each variable', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    expect(dist.getHeadVariable('node1').levels).toEqual(['T', 'F'])
    expect(dist.getHeadVariable('node12').levels).toEqual(['T', 'F'])
    expect(dist.getHeadVariable('node36').levels).toEqual(['T', 'F'])
    expect(dist.getParentVariable('node2').levels).toEqual(['T', 'F'])
    expect(dist.getParentVariable('node14').levels).toEqual(['T', 'F'])
  })
})
