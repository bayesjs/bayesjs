import * as expect from 'expect'

import { allNodes } from '../../models/huge-network'
import { createNetwork } from '../../src/utils'
import { InferenceEngine } from '../../src/index'

const network = createNetwork(...allNodes)
const engine = new InferenceEngine(network)

function getPotentialFunction (headVariables: string[], parentVariables: string[], precision: number) {
  const potential = engine.getJointDistribution(headVariables, parentVariables).toJSON().potentialFunction
  return potential.map(x => Number.parseFloat(x.toPrecision(precision)))
}

// NOTE: Expected values were computed using R bnLearn and grain packages
// and rounded to 4 decimals of precision.
describe('getJointDistribution', () => {
  it('should construct the correct potential function for single node joins', () => {
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
  describe('should construct the correct potential function for two nodes in the same clique', () => {
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
  describe('should construct the correct potential function for join of two nodes in adjacent cliques', () => {
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
  describe('should construct the correct potential function for join of two non-adjacent cliques with 2 degrees of separation', () => {
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
  describe('should construct the correct potential function for join of two non-adjacent cliques with 3 degrees of separation', () => {
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
  describe('should construct the correct potential function for join of two non-adjacent cliques with 4 degrees of separation', () => {
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
  describe('should construct the correct potential function for join of two non-adjacent cliques with 5 degrees of separation', () => {
    it('cliques 0 - 10', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node11', 'node19'], [], 4)).toEqual(expected)
    })
    it('cliques 10 - 14', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node19', 'node3'], [], 4)).toEqual(expected)
    })
  })
  describe('should construct the correct potential function for join of three nodes', () => {
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
  describe('should should construct the correct potential function for conditional distribution of two nodes', () => {
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
  describe('should construct the correct potential function for conditional distribution of two nodes from adjacent cliques', () => {
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
  describe('should construct the correct potential function for conditional distribution of two nodes from non-adjacent cliques with 2 degrees of separation', () => {
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

  describe('should construct the correct potential function for conditional distribution of two non-adjacent cliques with 3 degrees of separation', () => {
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
  describe('should construct the correct potential function for conditional distribution of two non-adjacent cliques with 4 degrees of separation', () => {
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
  describe('should construct the correct potential function for conditional distribution of two non-adjacent cliques with 5 degrees of separation', () => {
    it('cliques 0 - 10', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node11'], ['node19'], 4)).toEqual(expected)
    })
    it('cliques 10 - 14', () => {
      const expected: number[] = [0.9801, 0.0099, 0.0099, 0.0001]
      expect(getPotentialFunction(['node19'], ['node3'], 4)).toEqual(expected)
    })
  })
  describe('should construct the correct potential function for joint distribution conditioned on a variable', () => {
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
})
