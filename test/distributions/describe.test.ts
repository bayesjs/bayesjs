
import * as expect from 'expect'

import { network } from '../../models/huge-network'
import { InferenceEngine } from '../../src/index'
import { product, sum } from 'ramda'

const engine = new InferenceEngine(network)

describe('describe', () => {
  it('has the correct number of rows for a joint distribution', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], [])
    const descr = dist.describe()
    const json = dist.toJSON()
    const expected = 2 + json.potentialFunction.length
    const observed = descr.split('\n').length
    expect(observed).toEqual(expected)
  })
  it('has the correct number of rows for a conditional distribution', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    const descr = dist.describe()
    const json = dist.toJSON()
    const numberOfParentLevels: number[] = json.variableLevels.slice(json.numberOfHeadVariables).map(x => x.length)
    const expected = 1 + json.potentialFunction.length + product(numberOfParentLevels)
    const observed = descr.split('\n').length
    expect(observed).toEqual(expected)
  })
  it('description of joint distribution sums to approximately 1', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], [])
    const descr = dist.describe()
    const rows = descr.split('\n').slice(2)
    const values: number[] = rows.map(x => Number.parseFloat(x.split('||')[1]))
    const expected = 1E-5
    const observed = Math.abs(1 - sum(values))
    expect(observed).toBeLessThan(expected)
  })
  it('each block of description of conditional distribution sums to approximately 1', () => {
    const dist = engine.getJointDistribution(['node1', 'node12', 'node36'], ['node2', 'node14'])
    const descr = dist.describe()
    const rows = descr.split('\n').slice(2)
    const json = dist.toJSON()
    const blocksize: number = product(json.variableLevels.slice(0, json.numberOfHeadVariables).map(x => x.length))
    const numberOfBlocks: number = product(json.variableLevels.slice(json.numberOfHeadVariables).map(x => x.length))
    const expected = 1E-5
    for (let i = 0; i < numberOfBlocks; i++) {
      const block = rows.slice(i + i * blocksize, i + (i + 1) * blocksize)
      const values: number[] = block.map(x => Number.parseFloat(x.split('||')[1]))
      const observed = Math.abs(1 - sum(values))
      expect(observed).toBeLessThan(expected)
    }
  })
})
