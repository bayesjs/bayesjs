import * as expect from 'expect'

import { IInferenceEngine } from '../../src/types'
import { allNodes } from '../../models/rain-sprinkler-grasswet'
import { createNetwork } from '../../src/utils'
import { InferenceEngine } from '../../src/index'

const network = createNetwork(...allNodes)
const engine = new InferenceEngine(network)

const infersSingleNode = (engine: IInferenceEngine) => {
  const { infer } = engine

  expect(infer({ RAIN: 'T' }).toFixed(4)).toBe('0.2000')
  expect(infer({ RAIN: 'F' }).toFixed(4)).toBe('0.8000')
  expect(infer({ SPRINKLER: 'T' }).toFixed(4)).toBe('0.3220')
  expect(infer({ SPRINKLER: 'F' }).toFixed(4)).toBe('0.6780')
  expect(infer({ GRASS_WET: 'T' }).toFixed(4)).toBe('0.4484')
  expect(infer({ GRASS_WET: 'F' }).toFixed(4)).toBe('0.5516')
}

const infersMultiplesNodes = (engine: IInferenceEngine) => {
  const { infer } = engine

  const nodesToInfer = {
    RAIN: 'T',
    SPRINKLER: 'T',
    GRASS_WET: 'T',
  }

  expect(infer(nodesToInfer).toFixed(4)).toBe('0.0020')
}

const inferOnNodesGivingOthers = (engine: IInferenceEngine) => {
  const { infer } = engine
  const nodeToInfer = { RAIN: 'T' }
  engine.setEvidence({ GRASS_WET: 'T' })

  expect(infer(nodeToInfer).toFixed(4)).toBe('0.3577')
}

const tests: { [key: string]: (engine: IInferenceEngine) => void } = {
  'infers single node': infersSingleNode,
  'infers multiples nodes': infersMultiplesNodes,
  'infers on nodes giving others': inferOnNodesGivingOthers,
}

describe('infers', () => {
  describe('default', () => {
    const testNames = Object.keys(tests)

    for (const testName of testNames) {
      const method = tests[testName]
      it(`${testName} (hugin engine)`, () => method(engine))
    }
  })
})
