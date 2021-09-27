import * as expect from 'expect'

import { IInferenceEngine } from '../../src/types'
import { allNodes } from '../../models/rain-sprinkler-grasswet'
import { createNetwork } from '../../src/utils'
import { HuginInferenceEngine } from '../../src/inferences/junctionTree/hugin-inference-engine'

const infersGiveSprinklerTrue = (engine: IInferenceEngine) => {
  const { infer } = engine
  engine.setEvidence({ SPRINKLER: 'T' })

  expect(infer({ RAIN: 'T' }).toFixed(4)).toBe('0.0062')
  expect(infer({ RAIN: 'F' }).toFixed(4)).toBe('0.9938')
  expect(infer({ GRASS_WET: 'T' }).toFixed(4)).toBe('0.9006')
  expect(infer({ GRASS_WET: 'F' }).toFixed(4)).toBe('0.0994')
}

const infersGiveSprinklerFalse = (engine: IInferenceEngine) => {
  const { infer } = engine
  engine.setEvidence({ SPRINKLER: 'F' })

  expect(infer({ RAIN: 'T' }).toFixed(4)).toBe('0.2920')
  expect(infer({ RAIN: 'F' }).toFixed(4)).toBe('0.7080')
  expect(infer({ GRASS_WET: 'T' }).toFixed(4)).toBe('0.2336')
  expect(infer({ GRASS_WET: 'F' }).toFixed(4)).toBe('0.7664')
}

const infersGiveRainTrue = (engine: IInferenceEngine) => {
  const { infer } = engine
  engine.setEvidence({ RAIN: 'T' })

  expect(infer({ SPRINKLER: 'T' }).toFixed(4)).toBe('0.0100')
  expect(infer({ SPRINKLER: 'F' }).toFixed(4)).toBe('0.9900')
  expect(infer({ GRASS_WET: 'T' }).toFixed(4)).toBe('0.8019')
  expect(infer({ GRASS_WET: 'F' }).toFixed(4)).toBe('0.1981')
}

const infersGiveRainFalse = (engine: IInferenceEngine) => {
  const { infer } = engine
  engine.setEvidence({ RAIN: 'F' })

  expect(infer({ SPRINKLER: 'T' }).toFixed(4)).toBe('0.4000')
  expect(infer({ SPRINKLER: 'F' }).toFixed(4)).toBe('0.6000')
  expect(infer({ GRASS_WET: 'T' }).toFixed(4)).toBe('0.3600')
  expect(infer({ GRASS_WET: 'F' }).toFixed(4)).toBe('0.6400')
}

const infersGiveGrassWetTrue = (engine: IInferenceEngine) => {
  const { infer } = engine
  engine.setEvidence({ GRASS_WET: 'T' })

  expect(infer({ RAIN: 'T' }).toFixed(4)).toBe('0.3577')
  expect(infer({ RAIN: 'F' }).toFixed(4)).toBe('0.6423')
  expect(infer({ SPRINKLER: 'T' }).toFixed(4)).toBe('0.6467')
  expect(infer({ SPRINKLER: 'F' }).toFixed(4)).toBe('0.3533')
}

const infersGiveGrassWetFalse = (engine: IInferenceEngine) => {
  const { infer } = engine
  engine.setEvidence({ GRASS_WET: 'F' })

  expect(infer({ RAIN: 'T' }).toFixed(4)).toBe('0.0718')
  expect(infer({ RAIN: 'F' }).toFixed(4)).toBe('0.9282')
  expect(infer({ SPRINKLER: 'T' }).toFixed(4)).toBe('0.0580')
  expect(infer({ SPRINKLER: 'F' }).toFixed(4)).toBe('0.9420')
}

const tests: { [key: string]: (engine: IInferenceEngine) => void } = {
  'infers give Sprinkler True': infersGiveSprinklerTrue,
  'infers give Sprinkler False': infersGiveSprinklerFalse,
  'infers give Rain True': infersGiveRainTrue,
  'infers give Rain False': infersGiveRainFalse,
  'infers give Grass Wet True': infersGiveGrassWetTrue,
  'infers give Grass Wet False': infersGiveGrassWetFalse,
}

describe('infers', () => {
  describe('sprinkler network', () => {
    const testNames = Object.keys(tests)
    const network = createNetwork(...allNodes)
    const engine = new HuginInferenceEngine(network)

    for (const testName of testNames) {
      const method = tests[testName]

      it(`${testName} (hugin engine)`, () => method(engine))
    }
  })
})
