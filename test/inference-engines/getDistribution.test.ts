import * as expect from 'expect'

import { network } from '../../models/huge-network'
import { InferenceEngine, ICptWithParents, ICptWithoutParents } from '../../src/index'
import { fromCPT } from '../../src/engines'

describe('getDistribution', () => {
  it('round trip is faithful', () => {
    const engine = new InferenceEngine(network)
    const name = 'node3'
    const observed = engine.getDistribution(name).toJSON()
    const cpt = network[name]?.cpt as ICptWithParents | ICptWithoutParents
    const expected = fromCPT('node3', cpt).toJSON()
    expect(observed.numberOfHeadVariables).toEqual(expected.numberOfHeadVariables)
    expect(observed.variableNames).toEqual(expected.variableNames)
    expect(observed.variableLevels).toEqual(expected.variableLevels)
    expect(observed.potentialFunction.map(x => x.toExponential(5))).toEqual(expected.potentialFunction.map(x => x.toExponential(5)))
  })
})
