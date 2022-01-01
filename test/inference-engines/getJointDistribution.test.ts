import * as expect from 'expect'

import { allNodes } from '../../models/huge-network'
import { createNetwork } from '../../src/utils'
import { InferenceEngine } from '../../src/index'
import { evaluateMarginalPure } from '../../src/engines/evaluation'
import { difference, product, sum } from 'ramda'
import { fromCPT } from '../../src/engines'

const network = createNetwork(...allNodes)
const engine = new InferenceEngine(network)

function getPotentialFunction (headVariables: string[], parentVariables: string[], precision: number) {
  const potential = engine.getJointDistribution(headVariables, parentVariables).toJSON().potentialFunction
  return potential.map(x => Number.parseFloat(x.toPrecision(precision)))
}

function infer (event: { [name: string]: string}, evidence: { [name: string]: string}, precision: number) {
  const dist = engine.getJointDistribution(Object.keys(event), Object.keys(evidence))
  return Number.parseFloat(dist.infer(event, evidence).toPrecision(precision))
}

// NOTE: Expected values were computed using R bnLearn and grain packages
// and rounded to 4 decimals of precision.
describe('getDistribution', () => {
  it('should return the marginal for single node joins', () => {
    let expected: number[] = [0.9802, 0.0198]
    expect(getPotentialFunction(['node1'], [], 4)).toEqual(expected)
    expected = [0.99, 0.01]
    expect(getPotentialFunction(['node2'], [], 4)).toEqual(expected)
    expect(getPotentialFunction(['node3'], [], 4)).toEqual(expected)
    expect(getPotentialFunction(['node4'], [], 4)).toEqual(expected)
    expect(getPotentialFunction(['node5'], [], 4)).toEqual(expected)
    expect(getPotentialFunction(['node6'], [], 4)).toEqual(expected)
    expect(getPotentialFunction(['node7'], [], 4)).toEqual(expected)
    expect(getPotentialFunction(['node8'], [], 4)).toEqual(expected)
    expect(getPotentialFunction(['node9'], [], 4)).toEqual(expected)
    expect(getPotentialFunction(['node11'], [], 4)).toEqual(expected)
    expect(getPotentialFunction(['node12'], [], 4)).toEqual(expected)
    expect(getPotentialFunction(['node14'], [], 4)).toEqual(expected)
    expect(getPotentialFunction(['node15'], [], 4)).toEqual(expected)
    expect(getPotentialFunction(['node18'], [], 4)).toEqual(expected)
    expect(getPotentialFunction(['node19'], [], 4)).toEqual(expected)
    expect(getPotentialFunction(['node20'], [], 4)).toEqual(expected)
    expect(getPotentialFunction(['node21'], [], 4)).toEqual(expected)
    expect(getPotentialFunction(['node22'], [], 4)).toEqual(expected)
    expect(getPotentialFunction(['node23'], [], 4)).toEqual(expected)
    expect(getPotentialFunction(['node25'], [], 4)).toEqual(expected)
    expect(getPotentialFunction(['node26'], [], 4)).toEqual(expected)
    expect(getPotentialFunction(['node27'], [], 4)).toEqual(expected)
    expect(getPotentialFunction(['node28'], [], 4)).toEqual(expected)
    expect(getPotentialFunction(['node29'], [], 4)).toEqual(expected)
    expect(getPotentialFunction(['node30'], [], 4)).toEqual(expected)
    expect(getPotentialFunction(['node39'], [], 4)).toEqual(expected)
    expected = [0.9899, 0.0101]
    expect(getPotentialFunction(['node10'], [], 4)).toEqual(expected)
    expect(getPotentialFunction(['node13'], [], 4)).toEqual(expected)
    expect(getPotentialFunction(['node17'], [], 4)).toEqual(expected)
    expect(getPotentialFunction(['node37'], [], 4)).toEqual(expected)
    expect(getPotentialFunction(['node38'], [], 4)).toEqual(expected)
    expected = [0.0198, 0.9802]
    expect(getPotentialFunction(['node24'], [], 4)).toEqual(expected)
    expected = [0.9803, 0.0197]
    expect(getPotentialFunction(['node31'], [], 4)).toEqual(expected)
    expect(getPotentialFunction(['node32'], [], 4)).toEqual(expected)
    expect(getPotentialFunction(['node33'], [], 4)).toEqual(expected)
    expect(getPotentialFunction(['node34'], [], 4)).toEqual(expected)
    expect(getPotentialFunction(['node35'], [], 4)).toEqual(expected)
    expected = [0.0, 1.0]
    expect(getPotentialFunction(['node36'], [], 4)).toEqual(expected)
  })
  describe('should return correct joint for two nodes in the same clique', () => {
    it('clique 0', () => {
      const expected = [0.9801, 0.0099, 0.009802, 0.000198]
      expect(getPotentialFunction(['node10', 'node11'], [], 4)).toEqual(expected)
    })
    it('clique 1', () => {
      const expected = [0.9801, 0.0099, 0.009802, 0.000198]
      expect(getPotentialFunction(['node13', 'node14'], [], 4)).toEqual(expected)
    })
    it('clique 2', () => {
      const expected = [0.9801, 0.0099, 0.009802, 0.000198]
      expect(getPotentialFunction(['node17', 'node18'], [], 4)).toEqual(expected)
    })
    it('clique3', () => {
      const expected = [0.9800, 0.009899, 0.009899, 0.0002]
      expect(getPotentialFunction(['node37', 'node38'], [], 4)).toEqual(expected)
    })
    it('clique4', () => {
      const expected = [0.9801, 0.009801, 0.0099, 0.000199]
      expect(getPotentialFunction(['node2', 'node38'], [], 4)).toEqual(expected)
    })
    it('clique5', () => {
      const expected = [0.9704, 0.0099, 0.009802, 0.0099]
      expect(getPotentialFunction(['node1', 'node31'], [], 4)).toEqual(expected)
    })
    it('clique6', () => {
      const expected = [0.0099, 0.0099, 0.9703, 0.0099]
      expect(getPotentialFunction(['node1', 'node24'], [], 4)).toEqual(expected)
    })
    it('clique7', () => {
      const expected = [0.0196, 0.9607, 0.000198, 0.0195]
      expect(getPotentialFunction(['node24', 'node33'], [], 4)).toEqual(expected)
    })
    it('clique8', () => {
      const expected = [0.9704, 0.0099, 0.009802, 0.0099]
      expect(getPotentialFunction(['node1', 'node34'], [], 4)).toEqual(expected)
    })
    it('clique9', () => {
      const expected = [0.0196, 0.9607, 0.000198, 0.0195]
      expect(getPotentialFunction(['node24', 'node35'], [], 4)).toEqual(expected)
    })
    it('clique10', () => {
      const expected = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node18', 'node19'], [], 4)).toEqual(expected)
    })
    it('clique11', () => {
      const expected = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node25', 'node26'], [], 4)).toEqual(expected)
    })
    it('clique12', () => {
      const expected = [0.9799, 0.009996, 0.009997, 0.000102]
      expect(getPotentialFunction(['node13', 'node37'], [], 4)).toEqual(expected)
    })
    it('clique13', () => {
      const expected = [0.9703, 0.0196, 0.009899, 0.0002]
      expect(getPotentialFunction(['node1', 'node37'], [], 4)).toEqual(expected)
    })
  })
  describe('should return correct potential function for join of two nodes in adjacent cliques', () => {
    it('cliques 0 - 4', () => {
      const expected: number[] = [0.9800, 0.009898, 0.009997, 0.0001019]
      expect(getPotentialFunction(['node11', 'node38'], [], 4)).toEqual(expected)
    })
    it('cliques 1 - 13', () => {
      const expected: number[] = [0.9704, 0.009802, 0.0196, 0.000198]
      expect(getPotentialFunction(['node14', 'node1'], [], 4)).toEqual(expected)
    })
    it('cliques 2 - 10', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node23', 'node19'], [], 4)).toEqual(expected)
    })
    it('cliques 2 - 13', () => {
      const expected: number[] = [0.9704, 0.009802, 0.0196, 0.000198]
      expect(getPotentialFunction(['node19', 'node1'], [], 4)).toEqual(expected)
    })
    it('cliques 3 - 4', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node39', 'node2'], [], 4)).toEqual(expected)
    })
    it('cliques 3 - 13', () => {
      const expected: number[] = [0.01960, 0.000198, 0.9704, 0.009802]
      expect(getPotentialFunction(['node39', 'node24'], [], 4)).toEqual(expected)
    })
    it('cliques 4 - 10', () => {
      const expected: number[] = [0.98, 0.009899, 0.009997, 0.000101]
      expect(getPotentialFunction(['node3', 'node10'], [], 4)).toEqual(expected)
    })
    it('cliques 5 - 13', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node31', 'node16'], [], 4)).toEqual(expected)
    })
    it('cliques 6 - 13', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node32', 'node16'], [], 4)).toEqual(expected)
    })
    it('cliques 7 - 13', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node33', 'node16'], [], 4)).toEqual(expected)
    })
    it('cliques 8 - 13', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node34', 'node16'], [], 4)).toEqual(expected)
    })
    it('cliques 9 - 13', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node35', 'node16'], [], 4)).toEqual(expected)
    })
    it('cliques 11 - 13', () => {
      const expected: number[] = [0.9704, 0.009802, 0.0196, 0.000198]
      expect(getPotentialFunction(['node26', 'node1'], [], 4)).toEqual(expected)
    })
    it('cliques 12 - 13', () => {
      const expected: number[] = [0, 0, 0.9802, 0.0198]
      expect(getPotentialFunction(['node1', 'node36'], [], 4)).toEqual(expected)
    })
  })
  describe('should return correct potential function for join of two non-adjacent cliques with 2 degrees of separation', () => {
    it('cliques 0 - 14', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node3', 'node11'], [], 4)).toEqual(expected)
    })
    it('cliques 0 - 3', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node11', 'node39'], [], 4)).toEqual(expected)
    })
    it('cliques 1 - 2', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node14', 'node23'], [], 4)).toEqual(expected)
    })
    it('cliques 1 - 5', () => {
      const expected: number[] = [0.9705, 0.009803, 0.0195, 0.000197]
      expect(getPotentialFunction(['node14', 'node31'], [], 4)).toEqual(expected)
    })
    it('cliques 1 - 6', () => {
      const expected: number[] = [0.9705, 0.009803, 0.0195, 0.000197]
      expect(getPotentialFunction(['node14', 'node32'], [], 4)).toEqual(expected)
    })
    it('cliques 1 - 7', () => {
      const expected: number[] = [0.9705, 0.009803, 0.0195, 0.000197]
      expect(getPotentialFunction(['node14', 'node33'], [], 4)).toEqual(expected)
    })
    it('cliques 1 - 8', () => {
      const expected: number[] = [0.9705, 0.009803, 0.0195, 0.000197]
      expect(getPotentialFunction(['node14', 'node34'], [], 4)).toEqual(expected)
    })
    it('cliques 1 - 9', () => {
      const expected: number[] = [0.9705, 0.009803, 0.0195, 0.000197]
      expect(getPotentialFunction(['node14', 'node35'], [], 4)).toEqual(expected)
    })
    it('cliques 1 - 11', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node14', 'node26'], [], 4)).toEqual(expected)
    })
    it('cliques 1 - 12', () => {
      const expected: number[] = [0, 0, 0.99, 0.01]
      expect(getPotentialFunction(['node14', 'node36'], [], 4)).toEqual(expected)
    })
    it('cliques 1 - 3', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node14', 'node39'], [], 4)).toEqual(expected)
    })
    it('cliques 2 - 3', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node23', 'node39'], [], 4)).toEqual(expected)
    })
    it('cliques 2 - 5', () => {
      const expected: number[] = [0.9705, 0.009803, 0.01950, 0.000197]
      expect(getPotentialFunction(['node23', 'node31'], [], 4)).toEqual(expected)
    })
    it('cliques 2 - 6', () => {
      const expected: number[] = [0.9705, 0.009803, 0.01950, 0.000197]
      expect(getPotentialFunction(['node23', 'node32'], [], 4)).toEqual(expected)
    })
    it('cliques 2 - 7', () => {
      const expected: number[] = [0.9705, 0.009803, 0.01950, 0.000197]
      expect(getPotentialFunction(['node23', 'node33'], [], 4)).toEqual(expected)
    })
    it('cliques 2 - 8', () => {
      const expected: number[] = [0.9705, 0.009803, 0.01950, 0.000197]
      expect(getPotentialFunction(['node23', 'node34'], [], 4)).toEqual(expected)
    })
    it('cliques 2 - 9', () => {
      const expected: number[] = [0.9705, 0.009803, 0.01950, 0.000197]
      expect(getPotentialFunction(['node23', 'node35'], [], 4)).toEqual(expected)
    })
    it('cliques 2 - 11', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node23', 'node26'], [], 4)).toEqual(expected)
    })
    it('cliques 2 - 12', () => {
      const expected: number[] = [0.0, 0.0, 0.99, 0.01]
      expect(getPotentialFunction(['node23', 'node36'], [], 4)).toEqual(expected)
    })
    it('cliques 3 - 5', () => {
      const expected: number[] = [0.9705, 0.009803, 0.0195, 0.000197]
      expect(getPotentialFunction(['node39', 'node31'], [], 4)).toEqual(expected)
    })
    it('cliques 3 - 6', () => {
      const expected: number[] = [0.9705, 0.009803, 0.0195, 0.000197]
      expect(getPotentialFunction(['node39', 'node32'], [], 4)).toEqual(expected)
    })
    it('cliques 3 - 7', () => {
      const expected: number[] = [0.9705, 0.009803, 0.0195, 0.000197]
      expect(getPotentialFunction(['node39', 'node33'], [], 4)).toEqual(expected)
    })
    it('cliques 3 - 8', () => {
      const expected: number[] = [0.9705, 0.009803, 0.0195, 0.000197]
      expect(getPotentialFunction(['node39', 'node34'], [], 4)).toEqual(expected)
    })
    it('cliques 3 - 9', () => {
      const expected: number[] = [0.9705, 0.009803, 0.0195, 0.000197]
      expect(getPotentialFunction(['node39', 'node35'], [], 4)).toEqual(expected)
    })
    it('cliques 3 - 11', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node39', 'node26'], [], 4)).toEqual(expected)
    })
    it('cliques 3 - 12', () => {
      const expected: number[] = [0.0, 0.0, 0.99, 0.01]
      expect(getPotentialFunction(['node39', 'node36'], [], 4)).toEqual(expected)
    })
    it('cliques 3 - 14', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node39', 'node3'], [], 4)).toEqual(expected)
    })
    it('cliques 4 - 13', () => {
      const expected: number[] = [0.98, 0.009997, 0.009899, 0.000101]
      expect(getPotentialFunction(['node10', 'node16'], [], 4)).toEqual(expected)
    })
    it('cliques 5 - 6', () => {
      const expected: number[] = [0.9704, 0.0099, 0.0099, 0.009802]
      expect(getPotentialFunction(['node31', 'node32'], [], 4)).toEqual(expected)
    })
    it('cliques 5 - 7', () => {
      const expected: number[] = [0.9704, 0.0099, 0.0099, 0.009802]
      expect(getPotentialFunction(['node31', 'node33'], [], 4)).toEqual(expected)
    })
    it('cliques 5 - 8', () => {
      const expected: number[] = [0.9704, 0.0099, 0.0099, 0.009802]
      expect(getPotentialFunction(['node31', 'node34'], [], 4)).toEqual(expected)
    })
    it('cliques 5 - 9', () => {
      const expected: number[] = [0.9704, 0.0099, 0.0099, 0.009802]
      expect(getPotentialFunction(['node31', 'node35'], [], 4)).toEqual(expected)
    })
    it('cliques 5 - 11', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node31', 'node26'], [], 4)).toEqual(expected)
    })
    it('cliques 5 - 12', () => {
      const expected: number[] = [0.0, 0.0, 0.9803, 0.0197]
      expect(getPotentialFunction(['node31', 'node36'], [], 4)).toEqual(expected)
    })

    it('cliques 6 - 7', () => {
      const expected: number[] = [0.9704, 0.0099, 0.0099, 0.009802]
      expect(getPotentialFunction(['node32', 'node33'], [], 4)).toEqual(expected)
    })
    it('cliques 6 - 8', () => {
      const expected: number[] = [0.9704, 0.0099, 0.0099, 0.009802]
      expect(getPotentialFunction(['node32', 'node34'], [], 4)).toEqual(expected)
    })
    it('cliques 6 - 9', () => {
      const expected: number[] = [0.9704, 0.0099, 0.0099, 0.009802]
      expect(getPotentialFunction(['node32', 'node35'], [], 4)).toEqual(expected)
    })
    it('cliques 6 - 11', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node32', 'node26'], [], 4)).toEqual(expected)
    })
    it('cliques 6 - 12', () => {
      const expected: number[] = [0.0, 0.0, 0.9803, 0.0197]
      expect(getPotentialFunction(['node32', 'node36'], [], 4)).toEqual(expected)
    })

    it('cliques 7 - 8', () => {
      const expected: number[] = [0.9704, 0.0099, 0.0099, 0.009802]
      expect(getPotentialFunction(['node33', 'node34'], [], 4)).toEqual(expected)
    })
    it('cliques 7 - 9', () => {
      const expected: number[] = [0.9704, 0.0099, 0.0099, 0.009802]
      expect(getPotentialFunction(['node33', 'node35'], [], 4)).toEqual(expected)
    })
    it('cliques 7 - 11', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node33', 'node26'], [], 4)).toEqual(expected)
    })
    it('cliques 7 - 12', () => {
      const expected: number[] = [0.0, 0.0, 0.9803, 0.0197]
      expect(getPotentialFunction(['node33', 'node36'], [], 4)).toEqual(expected)
    })

    it('cliques 8 - 9', () => {
      const expected: number[] = [0.9704, 0.0099, 0.0099, 0.009802]
      expect(getPotentialFunction(['node34', 'node35'], [], 4)).toEqual(expected)
    })
    it('cliques 8 - 11', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node34', 'node26'], [], 4)).toEqual(expected)
    })
    it('cliques 8 - 12', () => {
      const expected: number[] = [0.0, 0.0, 0.9803, 0.0197]
      expect(getPotentialFunction(['node34', 'node36'], [], 4)).toEqual(expected)
    })

    it('cliques 9 - 11', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node35', 'node26'], [], 4)).toEqual(expected)
    })
    it('cliques 9 - 12', () => {
      const expected: number[] = [0.0, 0.0, 0.9803, 0.0197]
      expect(getPotentialFunction(['node35', 'node36'], [], 4)).toEqual(expected)
    })

    it('cliques 10 - 13', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node19', 'node16'], [], 4)).toEqual(expected)
    })

    it('cliques 11 - 12', () => {
      const expected: number[] = [0.00, 0.00, 0.99, 0.01]
      expect(getPotentialFunction(['node26', 'node36'], [], 4)).toEqual(expected)
    })
  })
  describe('should return correct potential function for join of two non-adjacent cliques with 3 degrees of separation', () => {
    it('cliques 0 - 13', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node11', 'node16'], [], 4)).toEqual(expected)
    })
    it('cliques 1 - 4', () => {
      const expected: number[] = [0.98, 0.009899, 0.009997, 0.000101]
      expect(getPotentialFunction(['node14', 'node10'], [], 4)).toEqual(expected)
    })
    it('cliques 1 - 10', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node14', 'node19'], [], 4)).toEqual(expected)
    })
    it('cliques 2 - 4', () => {
      const expected: number[] = [0.98, 0.009899, 0.009997, 0.000101]
      expect(getPotentialFunction(['node23', 'node10'], [], 4)).toEqual(expected)
    })
    it('cliques 3 - 10', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node39', 'node19'], [], 4)).toEqual(expected)
    })
    it('cliques 4 - 5', () => {
      const expected: number[] = [0.9704, 0.009899, 0.0195, 0.000199]
      expect(getPotentialFunction(['node10', 'node31'], [], 4)).toEqual(expected)
    })
    it('cliques 4 - 6', () => {
      const expected: number[] = [0.9704, 0.009899, 0.0195, 0.000199]
      expect(getPotentialFunction(['node10', 'node32'], [], 4)).toEqual(expected)
    })
    it('cliques 4 - 7', () => {
      const expected: number[] = [0.9704, 0.009899, 0.0195, 0.000199]
      expect(getPotentialFunction(['node10', 'node33'], [], 4)).toEqual(expected)
    })
    it('cliques 4 - 8', () => {
      const expected: number[] = [0.9704, 0.009899, 0.0195, 0.000199]
      expect(getPotentialFunction(['node10', 'node34'], [], 4)).toEqual(expected)
    })
    it('cliques 4 - 9', () => {
      const expected: number[] = [0.9704, 0.009899, 0.0195, 0.000199]
      expect(getPotentialFunction(['node10', 'node35'], [], 4)).toEqual(expected)
    })
    it('cliques 4 - 11', () => {
      const expected: number[] = [0.98, 0.009997, 0.009899, 0.000101]
      expect(getPotentialFunction(['node10', 'node26'], [], 4)).toEqual(expected)
    })
    it('cliques 4 - 12', () => {
      const expected: number[] = [0.0, 0.0, 0.9899, 0.0101]
      expect(getPotentialFunction(['node10', 'node36'], [], 4)).toEqual(expected)
    })
    it('cliques 5 - 10', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node31', 'node19'], [], 4)).toEqual(expected)
    })
    it('cliques 6 - 10', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node32', 'node19'], [], 4)).toEqual(expected)
    })
    it('cliques 7 - 10', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node33', 'node19'], [], 4)).toEqual(expected)
    })
    it('cliques 8 - 10', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node34', 'node19'], [], 4)).toEqual(expected)
    })
    it('cliques 9 - 10', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node35', 'node19'], [], 4)).toEqual(expected)
    })
    it('cliques 10 - 11', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node19', 'node26'], [], 4)).toEqual(expected)
    })
    it('cliques 10 - 12', () => {
      const expected: number[] = [0.0, 0.0, 0.99, 0.01]
      expect(getPotentialFunction(['node19', 'node36'], [], 4)).toEqual(expected)
    })
    it('cliques 13 - 14', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node16', 'node3'], [], 4)).toEqual(expected)
    })
  })
  describe('should return correct potential function for join of two non-adjacent cliques with 4 degrees of separation', () => {
    it('cliques 0 - 1', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node11', 'node14'], [], 4)).toEqual(expected)
    })
    it('cliques 0 - 2', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node11', 'node23'], [], 4)).toEqual(expected)
    })
    it('cliques 0 - 5', () => {
      const expected: number[] = [0.9705, 0.009803, 0.0195, 0.000197]
      expect(getPotentialFunction(['node11', 'node31'], [], 4)).toEqual(expected)
    })
    it('cliques 0 - 6', () => {
      const expected: number[] = [0.9705, 0.009803, 0.0195, 0.000197]
      expect(getPotentialFunction(['node11', 'node32'], [], 4)).toEqual(expected)
    })
    it('cliques 0 - 7', () => {
      const expected: number[] = [0.9705, 0.009803, 0.0195, 0.000197]
      expect(getPotentialFunction(['node11', 'node33'], [], 4)).toEqual(expected)
    })
    it('cliques 0 - 8', () => {
      const expected: number[] = [0.9705, 0.009803, 0.0195, 0.000197]
      expect(getPotentialFunction(['node11', 'node34'], [], 4)).toEqual(expected)
    })
    it('cliques 0 - 9', () => {
      const expected: number[] = [0.9705, 0.009803, 0.0195, 0.000197]
      expect(getPotentialFunction(['node11', 'node35'], [], 4)).toEqual(expected)
    })
    it('cliques 0 - 11', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node11', 'node26'], [], 4)).toEqual(expected)
    })
    it('cliques 0 - 12', () => {
      const expected: number[] = [0.0, 0.0, 0.99, 0.01]
      expect(getPotentialFunction(['node11', 'node36'], [], 4)).toEqual(expected)
    })
    it('cliques 1 - 14', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node14', 'node3'], [], 4)).toEqual(expected)
    })
    it('cliques 2 - 14', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node23', 'node3'], [], 4)).toEqual(expected)
    })
    it('cliques 4 - 10', () => {
      const expected: number[] = [0.98, 0.009997, 0.009899, 0.000101]
      expect(getPotentialFunction(['node10', 'node19'], [], 4)).toEqual(expected)
    })
    it('cliques 5 - 14', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node31', 'node3'], [], 4)).toEqual(expected)
    })
    it('cliques 6 - 14', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node32', 'node3'], [], 4)).toEqual(expected)
    })
    it('cliques 7 - 14', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node33', 'node3'], [], 4)).toEqual(expected)
    })
    it('cliques 8 - 14', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node34', 'node3'], [], 4)).toEqual(expected)
    })
    it('cliques 9 - 14', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node35', 'node3'], [], 4)).toEqual(expected)
    })
    it('cliques 11 - 14', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node26', 'node3'], [], 4)).toEqual(expected)
    })
    it('cliques 12 - 14', () => {
      const expected: number[] = [0.0, 0.99, 0.0, 0.01]
      expect(getPotentialFunction(['node36', 'node3'], [], 4)).toEqual(expected)
    })
  })
  describe('should return correct potential function for join of two non-adjacent cliques with 5 degrees of separation', () => {
    it('cliques 0 - 10', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node11', 'node19'], [], 4)).toEqual(expected)
    })
    it('cliques 10 - 14', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node19', 'node3'], [], 4)).toEqual(expected)
    })
  })
  describe('should return correct potential function for join of three nodes', () => {
    it('from the same clique', () => {
      const expected: number[] = [0.9703, 0.009801, 0.009801, 0.000099, 0.009801, 0.000099, 0.000099, 0.000001]
      expect(getPotentialFunction(['node5', 'node4', 'node3'], [], 4)).toEqual(expected)
    })
    it('from cliques with 1 degree of separation', () => {
      const expected: number[] = [0.9703, 0.009801, 0.009801, 0.000099, 0.009801, 0.000099, 0.000099, 0.000001]
      expect(getPotentialFunction(['node23', 'node14', 'node39'], [], 4)).toEqual(expected)
    })
    it('from cliques with 2 degrees of separation', () => {
      const expected: number[] = [0.9702, 0.0098, 0.0098, 0.00009899, 0.009897, 0.00009997, 0.00009997, 0.00000101]
      expect(getPotentialFunction(['node19', 'node14', 'node10'], [], 4)).toEqual(expected)
    })
  })
  describe('should return correct potential function for conditional distribution of two nodes', () => {
    it('clique 0', () => {
      const expected = [0.9801, 0.0099, 0.009802, 0.000198]
      expect(getPotentialFunction(['node10'], ['node11'], 4)).toEqual(expected)
    })
    it('clique 1', () => {
      const expected = [0.9801, 0.0099, 0.009802, 0.000198]
      expect(getPotentialFunction(['node13'], ['node14'], 4)).toEqual(expected)
    })
    it('clique 2', () => {
      const expected = [0.9801, 0.0099, 0.009802, 0.000198]
      expect(getPotentialFunction(['node17'], ['node18'], 4)).toEqual(expected)
    })
    it('clique3', () => {
      const expected = [0.9800, 0.009899, 0.009899, 0.0002]
      expect(getPotentialFunction(['node37'], ['node38'], 4)).toEqual(expected)
    })
    it('clique4', () => {
      const expected = [0.9801, 0.009801, 0.0099, 0.000199]
      expect(getPotentialFunction(['node2'], ['node38'], 4)).toEqual(expected)
    })
    it('clique5', () => {
      const expected = [0.9704, 0.0099, 0.009802, 0.0099]
      expect(getPotentialFunction(['node1'], ['node31'], 4)).toEqual(expected)
    })
    it('clique6', () => {
      const expected = [0.0099, 0.0099, 0.9703, 0.0099]
      expect(getPotentialFunction(['node1'], ['node24'], 4)).toEqual(expected)
    })
    it('clique7', () => {
      const expected = [0.0196, 0.9607, 0.000198, 0.0195]
      expect(getPotentialFunction(['node24'], ['node33'], 4)).toEqual(expected)
    })
    it('clique8', () => {
      const expected = [0.9704, 0.0099, 0.009802, 0.0099]
      expect(getPotentialFunction(['node1'], ['node34'], 4)).toEqual(expected)
    })
    it('clique9', () => {
      const expected = [0.0196, 0.9607, 0.000198, 0.0195]
      expect(getPotentialFunction(['node24'], ['node35'], 4)).toEqual(expected)
    })
    it('clique10', () => {
      const expected = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node18'], ['node19'], 4)).toEqual(expected)
    })
    it('clique11', () => {
      const expected = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node25'], ['node26'], 4)).toEqual(expected)
    })
    it('clique12', () => {
      const expected = [0.9799, 0.009996, 0.009997, 0.000102]
      expect(getPotentialFunction(['node13'], ['node37'], 4)).toEqual(expected)
    })
    it('clique13', () => {
      const expected = [0.9703, 0.0196, 0.009899, 0.0002]
      expect(getPotentialFunction(['node1'], ['node37'], 4)).toEqual(expected)
    })
  })
  describe('should return correct potential function for conditional distribution of two nodes from adjacent cliques', () => {
    it('cliques 0 - 4', () => {
      const expected: number[] = [0.9800, 0.009898, 0.009997, 0.0001019]
      expect(getPotentialFunction(['node11'], ['node38'], 4)).toEqual(expected)
    })
    it('cliques 1 - 13', () => {
      const expected: number[] = [0.9704, 0.009802, 0.0196, 0.000198]
      expect(getPotentialFunction(['node14'], ['node1'], 4)).toEqual(expected)
    })
    it('cliques 2 - 10', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node23'], ['node19'], 4)).toEqual(expected)
    })
    it('cliques 2 - 13', () => {
      const expected: number[] = [0.9704, 0.009802, 0.0196, 0.000198]
      expect(getPotentialFunction(['node19'], ['node1'], 4)).toEqual(expected)
    })
    it('cliques 3 - 4', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node39'], ['node2'], 4)).toEqual(expected)
    })
    it('cliques 3 - 13', () => {
      const expected: number[] = [0.01960, 0.000198, 0.9704, 0.009802]
      expect(getPotentialFunction(['node39'], ['node24'], 4)).toEqual(expected)
    })
    it('cliques 4 - 10', () => {
      const expected: number[] = [0.98, 0.009899, 0.009997, 0.000101]
      expect(getPotentialFunction(['node3'], ['node10'], 4)).toEqual(expected)
    })
    it('cliques 5 - 13', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node31'], ['node16'], 4)).toEqual(expected)
    })
    it('cliques 6 - 13', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node32'], ['node16'], 4)).toEqual(expected)
    })
    it('cliques 7 - 13', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node33'], ['node16'], 4)).toEqual(expected)
    })
    it('cliques 8 - 13', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node34'], ['node16'], 4)).toEqual(expected)
    })
    it('cliques 9 - 13', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node35'], ['node16'], 4)).toEqual(expected)
    })
    it('cliques 11 - 13', () => {
      const expected: number[] = [0.9704, 0.009802, 0.0196, 0.000198]
      expect(getPotentialFunction(['node26'], ['node1'], 4)).toEqual(expected)
    })
    it('cliques 12 - 13', () => {
      const expected: number[] = [0, 0, 0.9802, 0.0198]
      expect(getPotentialFunction(['node1'], ['node36'], 4)).toEqual(expected)
    })
  })
  describe('should return correct potential function for conditional distribution of two nodes from non-adjacent cliques with 2 degrees of separation', () => {
    it('cliques 0 - 14', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node3'], ['node11'], 4)).toEqual(expected)
    })
    it('cliques 0 - 3', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node11'], ['node39'], 4)).toEqual(expected)
    })
    it('cliques 1 - 2', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node14'], ['node23'], 4)).toEqual(expected)
    })
    it('cliques 1 - 5', () => {
      const expected: number[] = [0.9705, 0.009803, 0.0195, 0.000197]
      expect(getPotentialFunction(['node14'], ['node31'], 4)).toEqual(expected)
    })
    it('cliques 1 - 6', () => {
      const expected: number[] = [0.9705, 0.009803, 0.0195, 0.000197]
      expect(getPotentialFunction(['node14'], ['node32'], 4)).toEqual(expected)
    })
    it('cliques 1 - 7', () => {
      const expected: number[] = [0.9705, 0.009803, 0.0195, 0.000197]
      expect(getPotentialFunction(['node14'], ['node33'], 4)).toEqual(expected)
    })
    it('cliques 1 - 8', () => {
      const expected: number[] = [0.9705, 0.009803, 0.0195, 0.000197]
      expect(getPotentialFunction(['node14'], ['node34'], 4)).toEqual(expected)
    })
    it('cliques 1 - 9', () => {
      const expected: number[] = [0.9705, 0.009803, 0.0195, 0.000197]
      expect(getPotentialFunction(['node14'], ['node35'], 4)).toEqual(expected)
    })
    it('cliques 1 - 11', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node14'], ['node26'], 4)).toEqual(expected)
    })
    it('cliques 1 - 12', () => {
      const expected: number[] = [0, 0, 0.99, 0.01]
      expect(getPotentialFunction(['node14'], ['node36'], 4)).toEqual(expected)
    })
    it('cliques 1 - 3', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node14'], ['node39'], 4)).toEqual(expected)
    })
    it('cliques 2 - 3', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node23'], ['node39'], 4)).toEqual(expected)
    })
    it('cliques 2 - 5', () => {
      const expected: number[] = [0.9705, 0.009803, 0.01950, 0.000197]
      expect(getPotentialFunction(['node23'], ['node31'], 4)).toEqual(expected)
    })
    it('cliques 2 - 6', () => {
      const expected: number[] = [0.9705, 0.009803, 0.01950, 0.000197]
      expect(getPotentialFunction(['node23'], ['node32'], 4)).toEqual(expected)
    })
    it('cliques 2 - 7', () => {
      const expected: number[] = [0.9705, 0.009803, 0.01950, 0.000197]
      expect(getPotentialFunction(['node23'], ['node33'], 4)).toEqual(expected)
    })
    it('cliques 2 - 8', () => {
      const expected: number[] = [0.9705, 0.009803, 0.01950, 0.000197]
      expect(getPotentialFunction(['node23'], ['node34'], 4)).toEqual(expected)
    })
    it('cliques 2 - 9', () => {
      const expected: number[] = [0.9705, 0.009803, 0.01950, 0.000197]
      expect(getPotentialFunction(['node23'], ['node35'], 4)).toEqual(expected)
    })
    it('cliques 2 - 11', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node23'], ['node26'], 4)).toEqual(expected)
    })
    it('cliques 2 - 12', () => {
      const expected: number[] = [0.0, 0.0, 0.99, 0.01]
      expect(getPotentialFunction(['node23'], ['node36'], 4)).toEqual(expected)
    })
    it('cliques 3 - 5', () => {
      const expected: number[] = [0.9705, 0.009803, 0.0195, 0.000197]
      expect(getPotentialFunction(['node39'], ['node31'], 4)).toEqual(expected)
    })
    it('cliques 3 - 6', () => {
      const expected: number[] = [0.9705, 0.009803, 0.0195, 0.000197]
      expect(getPotentialFunction(['node39'], ['node32'], 4)).toEqual(expected)
    })
    it('cliques 3 - 7', () => {
      const expected: number[] = [0.9705, 0.009803, 0.0195, 0.000197]
      expect(getPotentialFunction(['node39'], ['node33'], 4)).toEqual(expected)
    })
    it('cliques 3 - 8', () => {
      const expected: number[] = [0.9705, 0.009803, 0.0195, 0.000197]
      expect(getPotentialFunction(['node39'], ['node34'], 4)).toEqual(expected)
    })
    it('cliques 3 - 9', () => {
      const expected: number[] = [0.9705, 0.009803, 0.0195, 0.000197]
      expect(getPotentialFunction(['node39'], ['node35'], 4)).toEqual(expected)
    })
    it('cliques 3 - 11', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node39'], ['node26'], 4)).toEqual(expected)
    })
    it('cliques 3 - 12', () => {
      const expected: number[] = [0.0, 0.0, 0.99, 0.01]
      expect(getPotentialFunction(['node39'], ['node36'], 4)).toEqual(expected)
    })
    it('cliques 3 - 14', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node39'], ['node3'], 4)).toEqual(expected)
    })
    it('cliques 4 - 13', () => {
      const expected: number[] = [0.98, 0.009997, 0.009899, 0.000101]
      expect(getPotentialFunction(['node10'], ['node16'], 4)).toEqual(expected)
    })
    it('cliques 5 - 6', () => {
      const expected: number[] = [0.9704, 0.0099, 0.0099, 0.009802]
      expect(getPotentialFunction(['node31'], ['node32'], 4)).toEqual(expected)
    })
    it('cliques 5 - 7', () => {
      const expected: number[] = [0.9704, 0.0099, 0.0099, 0.009802]
      expect(getPotentialFunction(['node31'], ['node33'], 4)).toEqual(expected)
    })
    it('cliques 5 - 8', () => {
      const expected: number[] = [0.9704, 0.0099, 0.0099, 0.009802]
      expect(getPotentialFunction(['node31'], ['node34'], 4)).toEqual(expected)
    })
    it('cliques 5 - 9', () => {
      const expected: number[] = [0.9704, 0.0099, 0.0099, 0.009802]
      expect(getPotentialFunction(['node31'], ['node35'], 4)).toEqual(expected)
    })
    it('cliques 5 - 11', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node31'], ['node26'], 4)).toEqual(expected)
    })
    it('cliques 5 - 12', () => {
      const expected: number[] = [0.0, 0.0, 0.9803, 0.0197]
      expect(getPotentialFunction(['node31'], ['node36'], 4)).toEqual(expected)
    })

    it('cliques 6 - 7', () => {
      const expected: number[] = [0.9704, 0.0099, 0.0099, 0.009802]
      expect(getPotentialFunction(['node32'], ['node33'], 4)).toEqual(expected)
    })
    it('cliques 6 - 8', () => {
      const expected: number[] = [0.9704, 0.0099, 0.0099, 0.009802]
      expect(getPotentialFunction(['node32'], ['node34'], 4)).toEqual(expected)
    })
    it('cliques 6 - 9', () => {
      const expected: number[] = [0.9704, 0.0099, 0.0099, 0.009802]
      expect(getPotentialFunction(['node32'], ['node35'], 4)).toEqual(expected)
    })
    it('cliques 6 - 11', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node32'], ['node26'], 4)).toEqual(expected)
    })
    it('cliques 6 - 12', () => {
      const expected: number[] = [0.0, 0.0, 0.9803, 0.0197]
      expect(getPotentialFunction(['node32'], ['node36'], 4)).toEqual(expected)
    })

    it('cliques 7 - 8', () => {
      const expected: number[] = [0.9704, 0.0099, 0.0099, 0.009802]
      expect(getPotentialFunction(['node33'], ['node34'], 4)).toEqual(expected)
    })
    it('cliques 7 - 9', () => {
      const expected: number[] = [0.9704, 0.0099, 0.0099, 0.009802]
      expect(getPotentialFunction(['node33'], ['node35'], 4)).toEqual(expected)
    })
    it('cliques 7 - 11', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node33'], ['node26'], 4)).toEqual(expected)
    })
    it('cliques 7 - 12', () => {
      const expected: number[] = [0.0, 0.0, 0.9803, 0.0197]
      expect(getPotentialFunction(['node33'], ['node36'], 4)).toEqual(expected)
    })

    it('cliques 8 - 9', () => {
      const expected: number[] = [0.9704, 0.0099, 0.0099, 0.009802]
      expect(getPotentialFunction(['node34'], ['node35'], 4)).toEqual(expected)
    })
    it('cliques 8 - 11', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node34'], ['node26'], 4)).toEqual(expected)
    })
    it('cliques 8 - 12', () => {
      const expected: number[] = [0.0, 0.0, 0.9803, 0.0197]
      expect(getPotentialFunction(['node34'], ['node36'], 4)).toEqual(expected)
    })

    it('cliques 9 - 11', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node35'], ['node26'], 4)).toEqual(expected)
    })
    it('cliques 9 - 12', () => {
      const expected: number[] = [0.0, 0.0, 0.9803, 0.0197]
      expect(getPotentialFunction(['node35'], ['node36'], 4)).toEqual(expected)
    })

    it('cliques 10 - 13', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node19'], ['node16'], 4)).toEqual(expected)
    })

    it('cliques 11 - 12', () => {
      const expected: number[] = [0.00, 0.00, 0.99, 0.01]
      expect(getPotentialFunction(['node26'], ['node36'], 4)).toEqual(expected)
    })
  })

  describe('should return correct potential function for conditional distribution of two non-adjacent cliques with 3 degrees of separation', () => {
    it('cliques 0 - 13', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node11'], ['node16'], 4)).toEqual(expected)
    })
    it('cliques 1 - 4', () => {
      const expected: number[] = [0.98, 0.009899, 0.009997, 0.000101]
      expect(getPotentialFunction(['node14'], ['node10'], 4)).toEqual(expected)
    })
    it('cliques 1 - 10', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node14'], ['node19'], 4)).toEqual(expected)
    })
    it('cliques 2 - 4', () => {
      const expected: number[] = [0.98, 0.009899, 0.009997, 0.000101]
      expect(getPotentialFunction(['node23'], ['node10'], 4)).toEqual(expected)
    })
    it('cliques 3 - 10', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node39'], ['node19'], 4)).toEqual(expected)
    })
    it('cliques 4 - 5', () => {
      const expected: number[] = [0.9704, 0.009899, 0.0195, 0.000199]
      expect(getPotentialFunction(['node10'], ['node31'], 4)).toEqual(expected)
    })
    it('cliques 4 - 6', () => {
      const expected: number[] = [0.9704, 0.009899, 0.0195, 0.000199]
      expect(getPotentialFunction(['node10'], ['node32'], 4)).toEqual(expected)
    })
    it('cliques 4 - 7', () => {
      const expected: number[] = [0.9704, 0.009899, 0.0195, 0.000199]
      expect(getPotentialFunction(['node10'], ['node33'], 4)).toEqual(expected)
    })
    it('cliques 4 - 8', () => {
      const expected: number[] = [0.9704, 0.009899, 0.0195, 0.000199]
      expect(getPotentialFunction(['node10'], ['node34'], 4)).toEqual(expected)
    })
    it('cliques 4 - 9', () => {
      const expected: number[] = [0.9704, 0.009899, 0.0195, 0.000199]
      expect(getPotentialFunction(['node10'], ['node35'], 4)).toEqual(expected)
    })
    it('cliques 4 - 11', () => {
      const expected: number[] = [0.98, 0.009997, 0.009899, 0.000101]
      expect(getPotentialFunction(['node10'], ['node26'], 4)).toEqual(expected)
    })
    it('cliques 4 - 12', () => {
      const expected: number[] = [0.0, 0.0, 0.9899, 0.0101]
      expect(getPotentialFunction(['node10'], ['node36'], 4)).toEqual(expected)
    })
    it('cliques 5 - 10', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node31'], ['node19'], 4)).toEqual(expected)
    })
    it('cliques 6 - 10', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node32'], ['node19'], 4)).toEqual(expected)
    })
    it('cliques 7 - 10', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node33'], ['node19'], 4)).toEqual(expected)
    })
    it('cliques 8 - 10', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node34'], ['node19'], 4)).toEqual(expected)
    })
    it('cliques 9 - 10', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node35'], ['node19'], 4)).toEqual(expected)
    })
    it('cliques 10 - 11', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node19'], ['node26'], 4)).toEqual(expected)
    })
    it('cliques 10 - 12', () => {
      const expected: number[] = [0.0, 0.0, 0.99, 0.01]
      expect(getPotentialFunction(['node19'], ['node36'], 4)).toEqual(expected)
    })
    it('cliques 13 - 14', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node16'], ['node3'], 4)).toEqual(expected)
    })
  })
  describe('should return correct potential function for conditional distribution of two non-adjacent cliques with 4 degrees of separation', () => {
    it('cliques 0 - 1', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node11'], ['node14'], 4)).toEqual(expected)
    })
    it('cliques 0 - 2', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node11'], ['node23'], 4)).toEqual(expected)
    })
    it('cliques 0 - 5', () => {
      const expected: number[] = [0.9705, 0.009803, 0.0195, 0.000197]
      expect(getPotentialFunction(['node11'], ['node31'], 4)).toEqual(expected)
    })
    it('cliques 0 - 6', () => {
      const expected: number[] = [0.9705, 0.009803, 0.0195, 0.000197]
      expect(getPotentialFunction(['node11'], ['node32'], 4)).toEqual(expected)
    })
    it('cliques 0 - 7', () => {
      const expected: number[] = [0.9705, 0.009803, 0.0195, 0.000197]
      expect(getPotentialFunction(['node11'], ['node33'], 4)).toEqual(expected)
    })
    it('cliques 0 - 8', () => {
      const expected: number[] = [0.9705, 0.009803, 0.0195, 0.000197]
      expect(getPotentialFunction(['node11'], ['node34'], 4)).toEqual(expected)
    })
    it('cliques 0 - 9', () => {
      const expected: number[] = [0.9705, 0.009803, 0.0195, 0.000197]
      expect(getPotentialFunction(['node11'], ['node35'], 4)).toEqual(expected)
    })
    it('cliques 0 - 11', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node11'], ['node26'], 4)).toEqual(expected)
    })
    it('cliques 0 - 12', () => {
      const expected: number[] = [0.0, 0.0, 0.99, 0.01]
      expect(getPotentialFunction(['node11'], ['node36'], 4)).toEqual(expected)
    })
    it('cliques 1 - 14', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node14'], ['node3'], 4)).toEqual(expected)
    })
    it('cliques 2 - 14', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node23'], ['node3'], 4)).toEqual(expected)
    })
    it('cliques 4 - 10', () => {
      const expected: number[] = [0.98, 0.009997, 0.009899, 0.000101]
      expect(getPotentialFunction(['node10'], ['node19'], 4)).toEqual(expected)
    })
    it('cliques 5 - 14', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node31'], ['node3'], 4)).toEqual(expected)
    })
    it('cliques 6 - 14', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node32'], ['node3'], 4)).toEqual(expected)
    })
    it('cliques 7 - 14', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node33'], ['node3'], 4)).toEqual(expected)
    })
    it('cliques 8 - 14', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node34'], ['node3'], 4)).toEqual(expected)
    })
    it('cliques 9 - 14', () => {
      const expected: number[] = [0.9705, 0.0195, 0.009803, 0.000197]
      expect(getPotentialFunction(['node35'], ['node3'], 4)).toEqual(expected)
    })
    it('cliques 11 - 14', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node26'], ['node3'], 4)).toEqual(expected)
    })
    it('cliques 12 - 14', () => {
      const expected: number[] = [0.0, 0.99, 0.0, 0.01]
      expect(getPotentialFunction(['node36'], ['node3'], 4)).toEqual(expected)
    })
  })
  describe('should return correct potential function for conditional distribution of two non-adjacent cliques with 5 degrees of separation', () => {
    it('cliques 0 - 10', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node11'], ['node19'], 4)).toEqual(expected)
    })
    it('cliques 10 - 14', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node19'], ['node3'], 4)).toEqual(expected)
    })
  })
  describe('should return correct potential function for joint distribution conditioned on a variable', () => {
    it('from the same clique', () => {
      const expected: number[] = [0.9703, 0.009801, 0.009801, 0.000099, 0.009801, 0.000099, 0.000099, 0.000001]
      expect(getPotentialFunction(['node5', 'node4'], ['node3'], 4)).toEqual(expected)
    })
    it('from cliques with 1 degree of separation', () => {
      const expected: number[] = [0.9703, 0.009801, 0.009801, 0.000099, 0.009801, 0.000099, 0.000099, 0.000001]
      expect(getPotentialFunction(['node23', 'node14'], ['node39'], 4)).toEqual(expected)
    })
    it('from cliques with 2 degrees of separation', () => {
      const expected: number[] = [0.9702, 0.0098, 0.0098, 0.00009899, 0.009897, 0.00009997, 0.00009997, 0.00000101]
      expect(getPotentialFunction(['node19', 'node14'], ['node10'], 4)).toEqual(expected)
    })
  })
  fdescribe('should infer the correct liklihood for a distribution', () => {
    it('of one head variable', () => {
      const observed = infer({ node11: 'T' }, {}, 4)
      expect(observed).toEqual(0.9900)
    })
    it('of two head variables', () => {
      const observed = infer({ node11: 'T', node22: 'F' }, {}, 4)
      expect(observed).toEqual(0.0099)
    })
    it('of one head variable and one parent variable', () => {
      const observed = infer({ node11: 'T' }, { node22: 'F' }, 4)
      expect(observed).toEqual(0.99)
    })
    it('of one head variable and two parent variables', () => {
      const observed = infer({ node11: 'T' }, { node22: 'F', node31: 'F' }, 4)
      expect(observed).toEqual(0.99)
    })
    it('of two head variable and one parent variables', () => {
      const observed = infer({ node11: 'T', node22: 'F' }, { node31: 'F' }, 4)
      expect(observed).toEqual(0.0099)
    })
    it('of three head variables and one parent variables', () => {
      const observed = infer({ node11: 'T', node22: 'F', node16: 'F' }, { node31: 'F' }, 4)
      expect(observed).toEqual(0.000099)
    })
    it('of two head variables and two parent variables', () => {
      const observed = infer({ node11: 'T', node22: 'F' }, { node16: 'F', node31: 'F' }, 4)
      expect(observed).toEqual(0.0099)
    })
    it('infer should throw an error when not all head variables are provided', () => {
      const dist = engine.getJointDistribution(['node1', 'node2'], ['node3'])
      expect(() => dist.infer({ node1: 'T' }, { node3: 'F' })).toThrow()
    })
    it('infer should throw an error when not all parent variables are provided', () => {
      const dist = engine.getJointDistribution(['node1', 'node2'], ['node3'])
      expect(() => dist.infer({ node1: 'T', node2: 'F' })).toThrow()
    })
    it('infer should return zero when a invalid level is provided for a head variable', () => {
      const observed = infer({ node1: 'Z' }, { node2: 'T' }, 4)
      expect(observed).toEqual(0)
    })
    it('infer should return zero when a invalid level is provided for a parent variable', () => {
      const observed = infer({ node1: 'T' }, { node2: 'Z' }, 4)
      expect(observed).toEqual(0)
    })
    fit('it should infer the correct probability for a junction forest.', () => {
      const disconnected = new InferenceEngine({
        A: { id: 'A', states: ['T', 'F'], parents: [], potentialFunction: [0.1, 0.9] },
        B: { id: 'B', states: ['T', 'F'], parents: ['A'], potentialFunction: [0.2, 0.3, 0.3, 0.2] },
        C: { id: 'C', states: ['T', 'F'], parents: [], potentialFunction: [0.2, 0.8] },
        D: { id: 'D', states: ['T', 'F'], parents: ['C'], potentialFunction: [0.35, 0.15, 0.15, 0.35] },
        E: { id: 'E', states: ['T', 'F'], parents: [], potentialFunction: [0.6, 0.4] },
        F: { id: 'F', states: ['T', 'F'], parents: ['E'], potentialFunction: [0.45, 0.05, 0.05, 0.45] },
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
  })

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
  describe('fromCPT', () => {
    it('encodes the correct joint distribution without parents', () => {
      const dist = fromCPT('Foo', { bar: 10, baz: 90 })
      const json = dist.toJSON()
      expect(json.numberOfHeadVariables).toEqual(1)
      expect(json.variableNames).toEqual(['Foo'])
      expect(json.variableLevels).toEqual([['bar', 'baz']])
      expect(json.potentialFunction).toEqual([0.1, 0.9])
    })
    it('encodes the correct joint distribution with parents', () => {
      const dist = fromCPT('Foo', [
        { when: { animal: 'cat', color: 'black' }, then: { bar: 10, baz: 90 } },
        { when: { animal: 'cat', color: 'white' }, then: { bar: 70, baz: 30 } },
        { when: { animal: 'dog', color: 'black' }, then: { bar: 80, baz: 20 } },
        { when: { animal: 'dog', color: 'white' }, then: { bar: 40, baz: 60 } },
        { when: { animal: 'dog', color: 'brown' }, then: { bar: 90, baz: 10 } },
      ])
      const json = dist.toJSON()
      expect(json.numberOfHeadVariables).toEqual(1)
      expect(json.variableNames).toEqual(['Foo', 'animal', 'color'])
      expect(json.variableLevels).toEqual([['bar', 'baz'], ['cat', 'dog'], ['black', 'white', 'brown']])
      expect(json.potentialFunction).toEqual([
        0.02, 0.18, 0.16, 0.04, 0.14, 0.06, 0.08, 0.12, 0, 0, 0.18, 0.02,
      ])
    })
  })
})
