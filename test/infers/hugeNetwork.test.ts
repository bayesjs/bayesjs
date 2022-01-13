import * as expect from 'expect'

import { network } from '../../models/huge-network'
import { InferenceEngine } from '../../src/index'

const engine = new InferenceEngine(network)

function infer (event: { [name: string]: string[]}, evidence: { [name: string]: string[]}, precision: number) {
  engine.setEvidence(evidence)
  return Number.parseFloat(engine.infer(event).toPrecision(precision))
}

describe('should infer the correct probability from a distribution', () => {
  it('of one head variable', () => {
    const observed = infer({ node11: ['T'] }, {}, 4)
    expect(observed).toEqual(0.9900)
  })
  it('of two head variables', () => {
    const observed = infer({ node11: ['T'], node22: ['F'] }, {}, 4)
    expect(observed).toEqual(0.0099)
  })
  it('of one head variable and one parent variable', () => {
    const observed = infer({ node11: ['T'] }, { node22: ['F'] }, 4)
    expect(observed).toEqual(0.99)
  })
  it('of one head variable and two parent variables', () => {
    const observed = infer({ node11: ['T'] }, { node22: ['F'], node31: ['F'] }, 4)
    expect(observed).toEqual(0.99)
  })
  it('of two head variable and one parent variables', () => {
    const observed = infer({ node11: ['T'], node22: ['F'] }, { node31: ['F'] }, 4)
    expect(observed).toEqual(0.0099)
  })
  it('of three head variables and one parent variables', () => {
    const observed = infer({ node11: ['T'], node22: ['F'], node16: ['F'] }, { node31: ['F'] }, 4)
    expect(observed).toEqual(0.000099)
  })
  it('of two head variables and two parent variables', () => {
    const observed = infer({ node11: ['T'], node22: ['F'] }, { node16: ['F'], node31: ['F'] }, 4)
    expect(observed).toEqual(0.0099)
  })
  it('infer should throw an error when not all head variables are provided', () => {
    const dist = engine.getJointDistribution(['node1', 'node2'], ['node3'])
    expect(() => dist.infer({ node1: ['T'] }, { node3: ['F'] })).toThrow()
  })
  it('infer should throw an error when not all parent variables are provided', () => {
    const dist = engine.getJointDistribution(['node1', 'node2'], ['node3'])
    expect(() => dist.infer({ node1: ['T'], node2: ['F'] })).toThrow()
  })
  it('infer should return zero when a invalid level is provided for a head variable', () => {
    const observed = infer({ node1: ['Z'] }, { node2: ['T'] }, 4)
    expect(observed).toEqual(0)
  })
  it('infer should throw when only invalid levels are provided for a parent variable', () => expect(() => infer({ node1: ['T'] }, { node2: ['Z'] }, 4)).toThrow())
  it('it should infer the correct probability for a junction forest.', () => {
    const disconnected = new InferenceEngine({
      A: { levels: ['T', 'F'], parents: [], potentialFunction: [0.1, 0.9] },
      B: { levels: ['T', 'F'], parents: ['A'], potentialFunction: [0.2, 0.3, 0.3, 0.2] },
      C: { levels: ['T', 'F'], parents: [], potentialFunction: [0.2, 0.8] },
      D: { levels: ['T', 'F'], parents: ['C'], potentialFunction: [0.35, 0.15, 0.15, 0.35] },
      E: { levels: ['T', 'F'], parents: [], potentialFunction: [0.6, 0.4] },
      F: { levels: ['T', 'F'], parents: ['E'], potentialFunction: [0.45, 0.05, 0.05, 0.45] },
    })
    let dist = disconnected.getJointDistribution(['A', 'D'], [])
    let json = dist.toJSON()
    let observed = json.potentialFunction
    let expected = [0.038, 0.342, 0.062, 0.558]
    expect(observed.map(x => Number.parseFloat(x.toPrecision(4)))).toEqual(expected)

    dist = disconnected.getJointDistribution(['E', 'C', 'B'], [])
    json = dist.toJSON()
    observed = json.potentialFunction
    expected = [0.0696, 0.0464, 0.2784, 0.1856, 0.0504, 0.0336, 0.2016, 0.1344]
    expect(observed.map(x => Number.parseFloat(x.toPrecision(4)))).toEqual(expected)
  })
  it('should infer the correct value when evidence is provided for one of the variables', () => {
    engine.setEvidence({ node1: ['T'] })
    const dist = engine.getJointDistribution(['node31', 'node1'], [])
    expect(dist.infer({ node31: ['T'], node1: ['T'] })).toEqual(0.99)
    expect(dist.infer({ node31: ['T'], node1: ['F'] })).toEqual(0)
  })
})
