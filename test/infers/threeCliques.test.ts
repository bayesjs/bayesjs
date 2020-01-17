import * as expect from 'expect'

import { IInfer } from '../../src/types'
import { allNodes } from '../../models/three-cliques'
import { createNetwork } from '../../src/utils'
import { inferences } from '../../src'

const {
  enumeration,
  junctionTree,
  variableElimination,
} = inferences

const network = createNetwork(...allNodes)

const infersGiveAFalse = (infer: IInfer) => {
  const given = { A: 'F' }

  expect(infer(network, { B: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { C: 'T' }, given).toFixed(4)).toBe('0.1500')
  expect(infer(network, { D: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { E: 'T' }, given).toFixed(4)).toBe('0.5000')
}

const inferencesNames: { [key: string]: IInfer } = {
  Enumeration: enumeration.infer,
  'Junction Tree': junctionTree.infer,
  'Variable Elimination': variableElimination.infer,
}

const tests: { [key: string]: (infer: IInfer) => void } = {
  'infers give A False': infersGiveAFalse,
}

describe('infers', () => {
  describe('3q network', () => {
    const testNames = Object.keys(tests)
    const inferNames = Object.keys(inferencesNames)

    for (const testName of testNames) {
      const method = tests[testName]

      for (const inferName of inferNames) {
        const infer = inferencesNames[inferName]

        it(`${testName} (${inferName})`, () => method(infer))
      }
    }
  })
})
