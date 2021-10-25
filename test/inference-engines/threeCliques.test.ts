import * as expect from 'expect'

import { IInferenceEngine } from '../../src/types'
import { allNodes } from '../../models/three-cliques'
import { createNetwork } from '../../src/utils'
import { InferenceEngine } from '../../src/index'

const infersGiveNothing = (engine: IInferenceEngine) => {
  const { infer } = engine
  engine.setEvidence({})

  expect(infer({ A: 'T' }).toFixed(4)).toBe('0.5000')
  expect(infer({ A: 'F' }).toFixed(4)).toBe('0.5000')
  expect(infer({ B: 'T' }).toFixed(4)).toBe('0.5000')
  expect(infer({ B: 'F' }).toFixed(4)).toBe('0.5000')
  expect(infer({ C: 'T' }).toFixed(4)).toBe('0.1500')
  expect(infer({ C: 'F' }).toFixed(4)).toBe('0.8500')
  expect(infer({ D: 'T' }).toFixed(4)).toBe('0.5000')
  expect(infer({ D: 'F' }).toFixed(4)).toBe('0.5000')
  expect(infer({ E: 'T' }).toFixed(4)).toBe('0.5000')
  expect(infer({ E: 'F' }).toFixed(4)).toBe('0.5000')
}

const infersGiveAFalse = (engine: IInferenceEngine) => {
  const { infer } = engine
  engine.setEvidence({ A: 'F' })

  expect(infer({ A: 'T' }).toFixed(4)).toBe('0.0000')
  expect(infer({ A: 'F' }).toFixed(4)).toBe('1.0000')
  expect(infer({ B: 'T' }).toFixed(4)).toBe('0.5000')
  expect(infer({ B: 'F' }).toFixed(4)).toBe('0.5000')
  expect(infer({ C: 'T' }).toFixed(4)).toBe('0.1500')
  expect(infer({ C: 'F' }).toFixed(4)).toBe('0.8500')
  expect(infer({ D: 'T' }).toFixed(4)).toBe('0.5000')
  expect(infer({ D: 'F' }).toFixed(4)).toBe('0.5000')
  expect(infer({ E: 'T' }).toFixed(4)).toBe('0.5000')
  expect(infer({ E: 'F' }).toFixed(4)).toBe('0.5000')
}

const infersGiveATrue = (engine: IInferenceEngine) => {
  const { infer } = engine
  engine.setEvidence({ A: 'T' })

  expect(infer({ A: 'T' }).toFixed(4)).toBe('1.0000')
  expect(infer({ A: 'F' }).toFixed(4)).toBe('0.0000')
  expect(infer({ B: 'T' }).toFixed(4)).toBe('0.5000')
  expect(infer({ B: 'F' }).toFixed(4)).toBe('0.5000')
  expect(infer({ C: 'T' }).toFixed(4)).toBe('0.1500')
  expect(infer({ C: 'F' }).toFixed(4)).toBe('0.8500')
  expect(infer({ D: 'T' }).toFixed(4)).toBe('0.5000')
  expect(infer({ D: 'F' }).toFixed(4)).toBe('0.5000')
  expect(infer({ E: 'T' }).toFixed(4)).toBe('0.5000')
  expect(infer({ E: 'F' }).toFixed(4)).toBe('0.5000')
}

const infersGiveBFalse = (engine: IInferenceEngine) => {
  const { infer } = engine
  engine.setEvidence({ B: 'F' })

  expect(infer({ A: 'T' }).toFixed(4)).toBe('0.5000')
  expect(infer({ A: 'F' }).toFixed(4)).toBe('0.5000')
  expect(infer({ B: 'T' }).toFixed(4)).toBe('0.0000')
  expect(infer({ B: 'F' }).toFixed(4)).toBe('1.0000')
  expect(infer({ C: 'T' }).toFixed(4)).toBe('0.2000')
  expect(infer({ C: 'F' }).toFixed(4)).toBe('0.8000')
  expect(infer({ D: 'T' }).toFixed(4)).toBe('0.5000')
  expect(infer({ D: 'F' }).toFixed(4)).toBe('0.5000')
  expect(infer({ E: 'T' }).toFixed(4)).toBe('0.5000')
  expect(infer({ E: 'F' }).toFixed(4)).toBe('0.5000')
}

const infersGiveBTrue = (engine: IInferenceEngine) => {
  const { infer } = engine
  engine.setEvidence({ B: 'T' })

  expect(infer({ A: 'T' }).toFixed(4)).toBe('0.5000')
  expect(infer({ A: 'F' }).toFixed(4)).toBe('0.5000')
  expect(infer({ B: 'T' }).toFixed(4)).toBe('1.0000')
  expect(infer({ B: 'F' }).toFixed(4)).toBe('0.0000')
  expect(infer({ C: 'T' }).toFixed(4)).toBe('0.1000')
  expect(infer({ C: 'F' }).toFixed(4)).toBe('0.9000')
  expect(infer({ D: 'T' }).toFixed(4)).toBe('0.5000')
  expect(infer({ D: 'F' }).toFixed(4)).toBe('0.5000')
  expect(infer({ E: 'T' }).toFixed(4)).toBe('0.5000')
  expect(infer({ E: 'F' }).toFixed(4)).toBe('0.5000')
}

const infersGiveCFalse = (engine: IInferenceEngine) => {
  const { infer } = engine
  engine.setEvidence({ C: 'F' })

  expect(infer({ A: 'T' }).toFixed(4)).toBe('0.5000')
  expect(infer({ A: 'F' }).toFixed(4)).toBe('0.5000')
  expect(infer({ B: 'T' }).toFixed(4)).toBe('0.5294')
  expect(infer({ B: 'F' }).toFixed(4)).toBe('0.4706')
  expect(infer({ C: 'T' }).toFixed(4)).toBe('0.0000')
  expect(infer({ C: 'F' }).toFixed(4)).toBe('1.0000')
  expect(infer({ D: 'T' }).toFixed(4)).toBe('0.5000')
  expect(infer({ D: 'F' }).toFixed(4)).toBe('0.5000')
  expect(infer({ E: 'T' }).toFixed(4)).toBe('0.5000')
  expect(infer({ E: 'F' }).toFixed(4)).toBe('0.5000')
}

const infersGiveCTrue = (engine: IInferenceEngine) => {
  const { infer } = engine
  engine.setEvidence({ C: 'T' })

  expect(infer({ A: 'T' }).toFixed(4)).toBe('0.5000')
  expect(infer({ A: 'F' }).toFixed(4)).toBe('0.5000')
  expect(infer({ B: 'T' }).toFixed(4)).toBe('0.3333')
  expect(infer({ B: 'F' }).toFixed(4)).toBe('0.6667')
  expect(infer({ C: 'T' }).toFixed(4)).toBe('1.0000')
  expect(infer({ C: 'F' }).toFixed(4)).toBe('0.0000')
  expect(infer({ D: 'T' }).toFixed(4)).toBe('0.5000')
  expect(infer({ D: 'F' }).toFixed(4)).toBe('0.5000')
  expect(infer({ E: 'T' }).toFixed(4)).toBe('0.5000')
  expect(infer({ E: 'F' }).toFixed(4)).toBe('0.5000')
}

const infersGiveDFalse = (engine: IInferenceEngine) => {
  const { infer } = engine
  engine.setEvidence({ D: 'F' })

  expect(infer({ A: 'T' }).toFixed(4)).toBe('0.5000')
  expect(infer({ A: 'F' }).toFixed(4)).toBe('0.5000')
  expect(infer({ B: 'T' }).toFixed(4)).toBe('0.5000')
  expect(infer({ B: 'F' }).toFixed(4)).toBe('0.5000')
  expect(infer({ C: 'T' }).toFixed(4)).toBe('0.1500')
  expect(infer({ C: 'F' }).toFixed(4)).toBe('0.8500')
  expect(infer({ D: 'T' }).toFixed(4)).toBe('0.0000')
  expect(infer({ D: 'F' }).toFixed(4)).toBe('1.0000')
  expect(infer({ E: 'T' }).toFixed(4)).toBe('0.5000')
  expect(infer({ E: 'F' }).toFixed(4)).toBe('0.5000')
}

const infersGiveDTrue = (engine: IInferenceEngine) => {
  const { infer } = engine
  engine.setEvidence({ D: 'T' })

  expect(infer({ A: 'T' }).toFixed(4)).toBe('0.5000')
  expect(infer({ A: 'F' }).toFixed(4)).toBe('0.5000')
  expect(infer({ B: 'T' }).toFixed(4)).toBe('0.5000')
  expect(infer({ B: 'F' }).toFixed(4)).toBe('0.5000')
  expect(infer({ C: 'T' }).toFixed(4)).toBe('0.1500')
  expect(infer({ C: 'F' }).toFixed(4)).toBe('0.8500')
  expect(infer({ D: 'T' }).toFixed(4)).toBe('1.0000')
  expect(infer({ D: 'F' }).toFixed(4)).toBe('0.0000')
  expect(infer({ E: 'T' }).toFixed(4)).toBe('0.5000')
  expect(infer({ E: 'F' }).toFixed(4)).toBe('0.5000')
}

const infersGiveEFalse = (engine: IInferenceEngine) => {
  const { infer } = engine
  engine.setEvidence({ E: 'F' })

  expect(infer({ A: 'T' }).toFixed(4)).toBe('0.5000')
  expect(infer({ A: 'F' }).toFixed(4)).toBe('0.5000')
  expect(infer({ B: 'T' }).toFixed(4)).toBe('0.5000')
  expect(infer({ B: 'F' }).toFixed(4)).toBe('0.5000')
  expect(infer({ C: 'T' }).toFixed(4)).toBe('0.1500')
  expect(infer({ C: 'F' }).toFixed(4)).toBe('0.8500')
  expect(infer({ D: 'T' }).toFixed(4)).toBe('0.5000')
  expect(infer({ D: 'F' }).toFixed(4)).toBe('0.5000')
  expect(infer({ E: 'T' }).toFixed(4)).toBe('0.0000')
  expect(infer({ E: 'F' }).toFixed(4)).toBe('1.0000')
}

const infersGiveETrue = (engine: IInferenceEngine) => {
  const { infer } = engine
  engine.setEvidence({ E: 'T' })

  expect(infer({ A: 'T' }).toFixed(4)).toBe('0.5000')
  expect(infer({ A: 'F' }).toFixed(4)).toBe('0.5000')
  expect(infer({ B: 'T' }).toFixed(4)).toBe('0.5000')
  expect(infer({ B: 'F' }).toFixed(4)).toBe('0.5000')
  expect(infer({ C: 'T' }).toFixed(4)).toBe('0.1500')
  expect(infer({ C: 'F' }).toFixed(4)).toBe('0.8500')
  expect(infer({ D: 'T' }).toFixed(4)).toBe('0.5000')
  expect(infer({ D: 'F' }).toFixed(4)).toBe('0.5000')
  expect(infer({ E: 'T' }).toFixed(4)).toBe('1.0000')
  expect(infer({ E: 'F' }).toFixed(4)).toBe('0.0000')
}

const tests: { [key: string]: (engine: IInferenceEngine) => void } = {
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
    const network = createNetwork(...allNodes)
    const engine = new InferenceEngine(network)

    for (const testName of testNames) {
      const method = tests[testName]
      it(`${testName} (hugin engine)`, () => method(engine))
    }
  })
})
