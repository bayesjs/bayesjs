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

const infersGiveNothing = (infer: IInfer) => {
  const given = {}

  expect(infer(network, { A: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { A: 'F' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { B: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { B: 'F' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { C: 'T' }, given).toFixed(4)).toBe('0.1500')
  expect(infer(network, { C: 'F' }, given).toFixed(4)).toBe('0.8500')
  expect(infer(network, { D: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { D: 'F' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { E: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { E: 'F' }, given).toFixed(4)).toBe('0.5000')
}

const infersGiveAFalse = (infer: IInfer) => {
  const given = { A: 'F' }

  expect(infer(network, { B: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { B: 'F' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { C: 'T' }, given).toFixed(4)).toBe('0.1500')
  expect(infer(network, { C: 'F' }, given).toFixed(4)).toBe('0.8500')
  expect(infer(network, { D: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { D: 'F' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { E: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { E: 'F' }, given).toFixed(4)).toBe('0.5000')
}

const infersGiveATrue = (infer: IInfer) => {
  const given = { A: 'T' }

  expect(infer(network, { B: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { B: 'F' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { C: 'T' }, given).toFixed(4)).toBe('0.1500')
  expect(infer(network, { C: 'F' }, given).toFixed(4)).toBe('0.8500')
  expect(infer(network, { D: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { D: 'F' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { E: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { E: 'F' }, given).toFixed(4)).toBe('0.5000')
}

const infersGiveBFalse = (infer: IInfer) => {
  const given = { B: 'F' }

  expect(infer(network, { A: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { A: 'F' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { C: 'T' }, given).toFixed(4)).toBe('0.2000')
  expect(infer(network, { C: 'F' }, given).toFixed(4)).toBe('0.8000')
  expect(infer(network, { D: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { D: 'F' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { E: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { E: 'F' }, given).toFixed(4)).toBe('0.5000')
}

const infersGiveBTrue = (infer: IInfer) => {
  const given = { B: 'T' }

  expect(infer(network, { A: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { A: 'F' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { C: 'T' }, given).toFixed(4)).toBe('0.1000')
  expect(infer(network, { C: 'F' }, given).toFixed(4)).toBe('0.9000')
  expect(infer(network, { D: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { D: 'F' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { E: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { E: 'F' }, given).toFixed(4)).toBe('0.5000')
}

const infersGiveCFalse = (infer: IInfer) => {
  const given = { C: 'F' }

  expect(infer(network, { A: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { A: 'F' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { B: 'T' }, given).toFixed(4)).toBe('0.5294')
  expect(infer(network, { B: 'F' }, given).toFixed(4)).toBe('0.4706')
  expect(infer(network, { D: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { D: 'F' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { E: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { E: 'F' }, given).toFixed(4)).toBe('0.5000')
}

const infersGiveCTrue = (infer: IInfer) => {
  const given = { C: 'T' }

  expect(infer(network, { A: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { A: 'F' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { B: 'T' }, given).toFixed(4)).toBe('0.3333')
  expect(infer(network, { B: 'F' }, given).toFixed(4)).toBe('0.6667')
  expect(infer(network, { D: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { D: 'F' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { E: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { E: 'F' }, given).toFixed(4)).toBe('0.5000')
}

const infersGiveDFalse = (infer: IInfer) => {
  const given = { D: 'F' }

  expect(infer(network, { A: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { A: 'F' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { B: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { B: 'F' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { C: 'T' }, given).toFixed(4)).toBe('0.1500')
  expect(infer(network, { C: 'F' }, given).toFixed(4)).toBe('0.8500')
  expect(infer(network, { E: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { E: 'F' }, given).toFixed(4)).toBe('0.5000')
}

const infersGiveDTrue = (infer: IInfer) => {
  const given = { D: 'T' }

  expect(infer(network, { A: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { A: 'F' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { B: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { B: 'F' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { C: 'T' }, given).toFixed(4)).toBe('0.1500')
  expect(infer(network, { C: 'F' }, given).toFixed(4)).toBe('0.8500')
  expect(infer(network, { E: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { E: 'F' }, given).toFixed(4)).toBe('0.5000')
}

const infersGiveEFalse = (infer: IInfer) => {
  const given = { E: 'F' }

  expect(infer(network, { A: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { A: 'F' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { B: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { B: 'F' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { C: 'T' }, given).toFixed(4)).toBe('0.1500')
  expect(infer(network, { C: 'F' }, given).toFixed(4)).toBe('0.8500')
  expect(infer(network, { D: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { D: 'F' }, given).toFixed(4)).toBe('0.5000')
}

const infersGiveETrue = (infer: IInfer) => {
  const given = { E: 'T' }

  expect(infer(network, { A: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { A: 'F' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { B: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { B: 'F' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { C: 'T' }, given).toFixed(4)).toBe('0.1500')
  expect(infer(network, { C: 'F' }, given).toFixed(4)).toBe('0.8500')
  expect(infer(network, { D: 'T' }, given).toFixed(4)).toBe('0.5000')
  expect(infer(network, { D: 'F' }, given).toFixed(4)).toBe('0.5000')
}

const inferencesNames: { [key: string]: IInfer } = {
  Enumeration: enumeration.infer,
  'Junction Tree': junctionTree.infer,
  'Variable Elimination': variableElimination.infer,
}

const tests: { [key: string]: (infer: IInfer) => void } = {
  'infers give nothing': infersGiveNothing,
  'infers give A False': infersGiveAFalse,
  'infers give A True': infersGiveATrue,
  'infers give B False': infersGiveBFalse,
  'infers give B True': infersGiveBTrue,
  'infers give C False': infersGiveCFalse,
  'infers give C True': infersGiveCTrue,
  'infers give D False': infersGiveDFalse,
  'infers give D True': infersGiveDTrue,
  'infers give E False': infersGiveEFalse,
  'infers give E True': infersGiveETrue,
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
