import * as expect from 'expect'

import { IInferenceEngine } from '../../src/types'
import { allNodes } from '../../models/alarm'
import { createNetwork } from '../../src/utils'
import { HuginInferenceEngine } from '../../src/inferences/junctionTree/hugin-inference-engine'

const infersAlarmGiveBurglaryTrue = (engine: IInferenceEngine) => {
  engine.setEvidence({ BURGLARY: 'T' })
  const { infer } = engine

  expect(infer({ EARTHQUAKE: 'T' }).toFixed(4)).toBe('0.0020')
  expect(infer({ EARTHQUAKE: 'F' }).toFixed(4)).toBe('0.9980')
  expect(infer({ ALARM: 'T' }).toFixed(4)).toBe('0.9400')
  expect(infer({ ALARM: 'F' }).toFixed(4)).toBe('0.0600')
  expect(infer({ JOHN_CALLS: 'T' }).toFixed(4)).toBe('0.8490')
  expect(infer({ JOHN_CALLS: 'F' }).toFixed(4)).toBe('0.1510')
  expect(infer({ MARY_CALLS: 'T' }).toFixed(4)).toBe('0.6586')
  expect(infer({ MARY_CALLS: 'F' }).toFixed(4)).toBe('0.3414')
}

const infersAlarmGiveBurglaryFalse = (engine: IInferenceEngine) => {
  engine.setEvidence({ BURGLARY: 'F' })
  const { infer } = engine

  expect(infer({ EARTHQUAKE: 'T' }).toFixed(4)).toBe('0.0020')
  expect(infer({ EARTHQUAKE: 'F' }).toFixed(4)).toBe('0.9980')
  expect(infer({ ALARM: 'T' }).toFixed(4)).toBe('0.0016')
  expect(infer({ ALARM: 'F' }).toFixed(4)).toBe('0.9984')
  expect(infer({ JOHN_CALLS: 'T' }).toFixed(4)).toBe('0.0513')
  expect(infer({ JOHN_CALLS: 'F' }).toFixed(4)).toBe('0.9487')
  expect(infer({ MARY_CALLS: 'T' }).toFixed(4)).toBe('0.0111')
  expect(infer({ MARY_CALLS: 'F' }).toFixed(4)).toBe('0.9889')
}

const infersAlarmGiveEathQuakeTrue = (engine: IInferenceEngine) => {
  engine.setEvidence({ EARTHQUAKE: 'T' })
  const { infer } = engine

  expect(infer({ BURGLARY: 'T' }).toFixed(4)).toBe('0.0010')
  expect(infer({ BURGLARY: 'F' }).toFixed(4)).toBe('0.9990')
  expect(infer({ ALARM: 'T' }).toFixed(4)).toBe('0.2907')
  expect(infer({ ALARM: 'F' }).toFixed(4)).toBe('0.7093')
  expect(infer({ JOHN_CALLS: 'T' }).toFixed(4)).toBe('0.2971')
  expect(infer({ JOHN_CALLS: 'F' }).toFixed(4)).toBe('0.7029')
  expect(infer({ MARY_CALLS: 'T' }).toFixed(4)).toBe('0.2106')
  expect(infer({ MARY_CALLS: 'F' }).toFixed(4)).toBe('0.7894')
}

const infersAlarmGiveEathQuakeFalse = (engine: IInferenceEngine) => {
  engine.setEvidence({ EARTHQUAKE: 'F' })
  const { infer } = engine

  expect(infer({ BURGLARY: 'T' }).toFixed(4)).toBe('0.0010')
  expect(infer({ BURGLARY: 'F' }).toFixed(4)).toBe('0.9990')
  expect(infer({ ALARM: 'T' }).toFixed(4)).toBe('0.0019')
  expect(infer({ ALARM: 'F' }).toFixed(4)).toBe('0.9981')
  expect(infer({ JOHN_CALLS: 'T' }).toFixed(4)).toBe('0.0516')
  expect(infer({ JOHN_CALLS: 'F' }).toFixed(4)).toBe('0.9484')
  expect(infer({ MARY_CALLS: 'T' }).toFixed(4)).toBe('0.0113')
  expect(infer({ MARY_CALLS: 'F' }).toFixed(4)).toBe('0.9887')
}

const infersAlarmGiveAlarmTrue = (engine: IInferenceEngine) => {
  engine.setEvidence({ ALARM: 'T' })
  const { infer } = engine

  expect(infer({ BURGLARY: 'T' }).toFixed(4)).toBe('0.3736')
  expect(infer({ BURGLARY: 'F' }).toFixed(4)).toBe('0.6264')
  expect(infer({ EARTHQUAKE: 'T' }).toFixed(4)).toBe('0.2310')
  expect(infer({ EARTHQUAKE: 'F' }).toFixed(4)).toBe('0.7690')
  expect(infer({ JOHN_CALLS: 'T' }).toFixed(4)).toBe('0.9000')
  expect(infer({ JOHN_CALLS: 'F' }).toFixed(4)).toBe('0.1000')
  expect(infer({ MARY_CALLS: 'T' }).toFixed(4)).toBe('0.7000')
  expect(infer({ MARY_CALLS: 'F' }).toFixed(4)).toBe('0.3000')
}

const infersAlarmGiveAlarmFalse = (engine: IInferenceEngine) => {
  engine.setEvidence({ ALARM: 'F' })
  const { infer } = engine

  expect(infer({ BURGLARY: 'T' }).toFixed(4)).toBe('0.0001')
  expect(infer({ BURGLARY: 'F' }).toFixed(4)).toBe('0.9999')
  expect(infer({ EARTHQUAKE: 'T' }).toFixed(4)).toBe('0.0014')
  expect(infer({ EARTHQUAKE: 'F' }).toFixed(4)).toBe('0.9986')
  expect(infer({ JOHN_CALLS: 'T' }).toFixed(4)).toBe('0.0500')
  expect(infer({ JOHN_CALLS: 'F' }).toFixed(4)).toBe('0.9500')
  expect(infer({ MARY_CALLS: 'T' }).toFixed(4)).toBe('0.0100')
  expect(infer({ MARY_CALLS: 'F' }).toFixed(4)).toBe('0.9900')
}

const infersAlarmGiveJohnCallsTrue = (engine: IInferenceEngine) => {
  engine.setEvidence({ JOHN_CALLS: 'T' })
  const { infer } = engine

  expect(infer({ BURGLARY: 'T' }).toFixed(4)).toBe('0.0163')
  expect(infer({ BURGLARY: 'F' }).toFixed(4)).toBe('0.9837')
  expect(infer({ EARTHQUAKE: 'T' }).toFixed(4)).toBe('0.0114')
  expect(infer({ EARTHQUAKE: 'F' }).toFixed(4)).toBe('0.9886')
  expect(infer({ ALARM: 'T' }).toFixed(4)).toBe('0.0434')
  expect(infer({ ALARM: 'F' }).toFixed(4)).toBe('0.9566')
  expect(infer({ MARY_CALLS: 'T' }).toFixed(4)).toBe('0.0400')
  expect(infer({ MARY_CALLS: 'F' }).toFixed(4)).toBe('0.9600')
}

const infersAlarmGiveJohnCallsFalse = (engine: IInferenceEngine) => {
  engine.setEvidence({ JOHN_CALLS: 'F' })
  const { infer } = engine

  expect(infer({ BURGLARY: 'T' }).toFixed(4)).toBe('0.0002')
  expect(infer({ BURGLARY: 'F' }).toFixed(4)).toBe('0.9998')
  expect(infer({ EARTHQUAKE: 'T' }).toFixed(4)).toBe('0.0015')
  expect(infer({ EARTHQUAKE: 'F' }).toFixed(4)).toBe('0.9985')
  expect(infer({ ALARM: 'T' }).toFixed(4)).toBe('0.0003')
  expect(infer({ ALARM: 'F' }).toFixed(4)).toBe('0.9997')
  expect(infer({ MARY_CALLS: 'T' }).toFixed(4)).toBe('0.0102')
  expect(infer({ MARY_CALLS: 'F' }).toFixed(4)).toBe('0.9898')
}

const infersAlarmGiveMaryCallsTrue = (engine: IInferenceEngine) => {
  engine.setEvidence({ MARY_CALLS: 'T' })
  const { infer } = engine

  expect(infer({ BURGLARY: 'T' }).toFixed(4)).toBe('0.0561')
  expect(infer({ BURGLARY: 'F' }).toFixed(4)).toBe('0.9439')
  expect(infer({ EARTHQUAKE: 'T' }).toFixed(4)).toBe('0.0359')
  expect(infer({ EARTHQUAKE: 'F' }).toFixed(4)).toBe('0.9641')
  expect(infer({ ALARM: 'T' }).toFixed(4)).toBe('0.1501')
  expect(infer({ ALARM: 'F' }).toFixed(4)).toBe('0.8499')
  expect(infer({ JOHN_CALLS: 'T' }).toFixed(4)).toBe('0.1776')
  expect(infer({ JOHN_CALLS: 'F' }).toFixed(4)).toBe('0.8224')
}

const infersAlarmGiveMaryCallsFalse = (engine: IInferenceEngine) => {
  engine.setEvidence({ MARY_CALLS: 'F' })
  const { infer } = engine

  expect(infer({ BURGLARY: 'T' }).toFixed(4)).toBe('0.0003')
  expect(infer({ BURGLARY: 'F' }).toFixed(4)).toBe('0.9997')
  expect(infer({ EARTHQUAKE: 'T' }).toFixed(4)).toBe('0.0016')
  expect(infer({ EARTHQUAKE: 'F' }).toFixed(4)).toBe('0.9984')
  expect(infer({ ALARM: 'T' }).toFixed(4)).toBe('0.0008')
  expect(infer({ ALARM: 'F' }).toFixed(4)).toBe('0.9992')
  expect(infer({ JOHN_CALLS: 'T' }).toFixed(4)).toBe('0.0506')
  expect(infer({ JOHN_CALLS: 'F' }).toFixed(4)).toBe('0.9494')
}

const tests: { [key: string]: (engine: IInferenceEngine) => void } = {
  'infers give Burglary True': infersAlarmGiveBurglaryTrue,
  'infers give Burglary False': infersAlarmGiveBurglaryFalse,
  'infers give Eath Quake True': infersAlarmGiveEathQuakeTrue,
  'infers give Eath Quake False': infersAlarmGiveEathQuakeFalse,
  'infers give Alarm True': infersAlarmGiveAlarmTrue,
  'infers give Alarm False': infersAlarmGiveAlarmFalse,
  'infers give John Calls True': infersAlarmGiveJohnCallsTrue,
  'infers give John Calls False': infersAlarmGiveJohnCallsFalse,
  'infers give Mary Calls True': infersAlarmGiveMaryCallsTrue,
  'infers give Mary Calls False': infersAlarmGiveMaryCallsFalse,
}

describe('infers', () => {
  describe('alarm network', () => {
    const testNames = Object.keys(tests)
    const network = createNetwork(...allNodes)
    const engine = new HuginInferenceEngine(network)

    for (const testName of testNames) {
      const method = tests[testName]

      it(`${testName} (Hugin engine)`, () => method(engine))
    }
  })
})
