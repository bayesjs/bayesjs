import * as expect from 'expect'

import { allNodes } from '../../models/huge-network'
import { createNetwork } from '../../src/utils'
import { InferenceEngine, ICptWithParents, ICptWithoutParents } from '../../src/index'
import { fromCPT } from '../../src/engines'

describe('getDistribution', () => {
  it('round trip is faithful', () => {
    const network = createNetwork(...allNodes)
    const engine = new InferenceEngine(network)
    const name = 'node3'
    const observed = engine.getDistribution(name).toJSON()
    const cpt = allNodes.find(x => x.id === name)?.cpt as ICptWithParents | ICptWithoutParents
    const expected = fromCPT('node3', cpt).toJSON()
    expect(observed.numberOfHeadVariables).toEqual(expected.numberOfHeadVariables)
    expect(observed.variableNames).toEqual(expected.variableNames)
    expect(observed.variableLevels).toEqual(expected.variableLevels)
    expect(observed.potentialFunction.map(x => x.toExponential(5))).toEqual(expected.potentialFunction.map(x => x.toExponential(5)))
  })
})
