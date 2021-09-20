import * as expect from 'expect'

import { IInfer, INode } from '../../src/types'
import { createNetwork } from '../../src/utils'
import { inferences } from '../../src'

const {
  enumeration,
  junctionTree,
  variableElimination,
} = inferences

/* This test confirms that the junction tree inference algorithm produces
the correct results when the Bayesian network consists of more than one
connected component.   This test uses the following network:

   A      a
  / \    / \
 B   C  b   c

 where B and C are conditioned on A, and b and c are conditioned upon a.
 As originally implemented, the HUGIN algorithm performs message passing
 only for the connected component containing {A,B,C}, producing incorrect
 inferences for c.
*/

const nodes: INode[] = [
  {
    id: 'A',
    states: ['T', 'F'],
    parents: [],
    cpt: { T: 0.9, F: 0.1 },
  },
  {
    id: 'a',
    states: ['T', 'F'],
    parents: [],
    cpt: { T: 0.9, F: 0.1 },
  },
  {
    id: 'B',
    states: ['T', 'F'],
    parents: ['A'],
    cpt: [
      { when: { A: 'T' }, then: { T: 0.9, F: 0.1 } },
      { when: { A: 'F' }, then: { T: 0.1, F: 0.9 } },
    ],
  },
  {
    id: 'C',
    states: ['T', 'F'],
    parents: ['A'],
    cpt: [
      { when: { A: 'T' }, then: { T: 0.9, F: 0.1 } },
      { when: { A: 'F' }, then: { T: 0.1, F: 0.9 } },
    ],
  },
  {
    id: 'b',
    states: ['T', 'F'],
    parents: ['a'],
    cpt: [
      { when: { a: 'T' }, then: { T: 0.9, F: 0.1 } },
      { when: { a: 'F' }, then: { T: 0.1, F: 0.9 } },
    ],
  },
  {
    id: 'c',
    states: ['T', 'F'],
    parents: ['a'],
    cpt: [
      { when: { a: 'T' }, then: { T: 0.9, F: 0.1 } },
      { when: { a: 'F' }, then: { T: 0.1, F: 0.9 } },
    ],
  },
]

const network = createNetwork(...nodes)
const infersGiveNothing = (infer: IInfer) => {
  const given = {}

  expect(infer(network, { A: 'T' }, given).toFixed(4)).toBe('0.9000')
  expect(infer(network, { A: 'F' }, given).toFixed(4)).toBe('0.1000')
  expect(infer(network, { B: 'T' }, given).toFixed(4)).toBe('0.8200')
  expect(infer(network, { B: 'F' }, given).toFixed(4)).toBe('0.1800')
  expect(infer(network, { C: 'T' }, given).toFixed(4)).toBe('0.8200')
  expect(infer(network, { C: 'F' }, given).toFixed(4)).toBe('0.1800')
  expect(infer(network, { a: 'T' }, given).toFixed(4)).toBe('0.9000')
  expect(infer(network, { a: 'F' }, given).toFixed(4)).toBe('0.1000')
  expect(infer(network, { b: 'T' }, given).toFixed(4)).toBe('0.8200')
  expect(infer(network, { b: 'F' }, given).toFixed(4)).toBe('0.1800')
  expect(infer(network, { c: 'T' }, given).toFixed(4)).toBe('0.8200')
  expect(infer(network, { c: 'F' }, given).toFixed(4)).toBe('0.1800')
}

const infersGiveAFalse = (infer: IInfer) => {
  const given = { A: 'F' }

  expect(infer(network, { B: 'T' }, given).toFixed(4)).toBe('0.1000')
  expect(infer(network, { B: 'F' }, given).toFixed(4)).toBe('0.9000')
  expect(infer(network, { C: 'T' }, given).toFixed(4)).toBe('0.1000')
  expect(infer(network, { C: 'F' }, given).toFixed(4)).toBe('0.9000')
  expect(infer(network, { a: 'T' }, given).toFixed(4)).toBe('0.9000')
  expect(infer(network, { a: 'F' }, given).toFixed(4)).toBe('0.1000')
  expect(infer(network, { b: 'T' }, given).toFixed(4)).toBe('0.8200')
  expect(infer(network, { b: 'F' }, given).toFixed(4)).toBe('0.1800')
  expect(infer(network, { c: 'T' }, given).toFixed(4)).toBe('0.8200')
  expect(infer(network, { c: 'F' }, given).toFixed(4)).toBe('0.1800')
}

const infersGiveATrue = (infer: IInfer) => {
  const given = { A: 'T' }

  expect(infer(network, { B: 'T' }, given).toFixed(4)).toBe('0.9000')
  expect(infer(network, { B: 'F' }, given).toFixed(4)).toBe('0.1000')
  expect(infer(network, { C: 'T' }, given).toFixed(4)).toBe('0.9000')
  expect(infer(network, { C: 'F' }, given).toFixed(4)).toBe('0.1000')
  expect(infer(network, { a: 'T' }, given).toFixed(4)).toBe('0.9000')
  expect(infer(network, { a: 'F' }, given).toFixed(4)).toBe('0.1000')
  expect(infer(network, { b: 'T' }, given).toFixed(4)).toBe('0.8200')
  expect(infer(network, { b: 'F' }, given).toFixed(4)).toBe('0.1800')
  expect(infer(network, { c: 'T' }, given).toFixed(4)).toBe('0.8200')
  expect(infer(network, { c: 'F' }, given).toFixed(4)).toBe('0.1800')
}

const infersGiveaFalse = (infer: IInfer) => {
  const given = { a: 'T' }

  expect(infer(network, { b: 'T' }, given).toFixed(4)).toBe('0.9000')
  expect(infer(network, { b: 'F' }, given).toFixed(4)).toBe('0.1000')
  expect(infer(network, { c: 'T' }, given).toFixed(4)).toBe('0.9000')
  expect(infer(network, { c: 'F' }, given).toFixed(4)).toBe('0.1000')
  expect(infer(network, { A: 'T' }, given).toFixed(4)).toBe('0.9000')
  expect(infer(network, { A: 'F' }, given).toFixed(4)).toBe('0.1000')
  expect(infer(network, { B: 'T' }, given).toFixed(4)).toBe('0.8200')
  expect(infer(network, { B: 'F' }, given).toFixed(4)).toBe('0.1800')
  expect(infer(network, { C: 'T' }, given).toFixed(4)).toBe('0.8200')
  expect(infer(network, { C: 'F' }, given).toFixed(4)).toBe('0.1800')
}

const infersGiveaTrue = (infer: IInfer) => {
  const given = { a: 'F' }

  expect(infer(network, { b: 'T' }, given).toFixed(4)).toBe('0.1000')
  expect(infer(network, { b: 'F' }, given).toFixed(4)).toBe('0.9000')
  expect(infer(network, { c: 'T' }, given).toFixed(4)).toBe('0.1000')
  expect(infer(network, { c: 'F' }, given).toFixed(4)).toBe('0.9000')
  expect(infer(network, { A: 'T' }, given).toFixed(4)).toBe('0.9000')
  expect(infer(network, { A: 'F' }, given).toFixed(4)).toBe('0.1000')
  expect(infer(network, { B: 'T' }, given).toFixed(4)).toBe('0.8200')
  expect(infer(network, { B: 'F' }, given).toFixed(4)).toBe('0.1800')
  expect(infer(network, { C: 'T' }, given).toFixed(4)).toBe('0.8200')
  expect(infer(network, { C: 'F' }, given).toFixed(4)).toBe('0.1800')
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
  'infers give a False': infersGiveaFalse,
  'infers give a True': infersGiveaTrue,
}

describe('infers', () => {
  describe('two connected component network', () => {
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
