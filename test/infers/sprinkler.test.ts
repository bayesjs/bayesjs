import * as expect from 'expect'

import { IInfer } from '../../src/types'
import { allNodes } from '../../models/rain-sprinkler-grasswet'
import { createNetwork } from '../../src/utils'
import { inferences } from '../../src'

const {
  enumeration,
  junctionTree,
  variableElimination,
} = inferences

const network = createNetwork(...allNodes)

const infersGiveSprinklerTrue = (infer: IInfer) => {
  const given = { SPRINKLER: 'T' }

  expect(infer(network, { RAIN: 'T' }, given).toFixed(4)).toBe('0.0062')
  expect(infer(network, { RAIN: 'F' }, given).toFixed(4)).toBe('0.9938')
  expect(infer(network, { GRASS_WET: 'T' }, given).toFixed(4)).toBe('0.9006')
  expect(infer(network, { GRASS_WET: 'F' }, given).toFixed(4)).toBe('0.0994')
}

const infersGiveSprinklerFalse = (infer: IInfer) => {
  const given = { SPRINKLER: 'F' }

  expect(infer(network, { RAIN: 'T' }, given).toFixed(4)).toBe('0.2920')
  expect(infer(network, { RAIN: 'F' }, given).toFixed(4)).toBe('0.7080')
  expect(infer(network, { GRASS_WET: 'T' }, given).toFixed(4)).toBe('0.2336')
  expect(infer(network, { GRASS_WET: 'F' }, given).toFixed(4)).toBe('0.7664')
}

const infersGiveRainTrue = (infer: IInfer) => {
  const given = { RAIN: 'T' }

  expect(infer(network, { SPRINKLER: 'T' }, given).toFixed(4)).toBe('0.0100')
  expect(infer(network, { SPRINKLER: 'F' }, given).toFixed(4)).toBe('0.9900')
  expect(infer(network, { GRASS_WET: 'T' }, given).toFixed(4)).toBe('0.8019')
  expect(infer(network, { GRASS_WET: 'F' }, given).toFixed(4)).toBe('0.1981')
}

const infersGiveRainFalse = (infer: IInfer) => {
  const given = { RAIN: 'F' }

  expect(infer(network, { SPRINKLER: 'T' }, given).toFixed(4)).toBe('0.4000')
  expect(infer(network, { SPRINKLER: 'F' }, given).toFixed(4)).toBe('0.6000')
  expect(infer(network, { GRASS_WET: 'T' }, given).toFixed(4)).toBe('0.3600')
  expect(infer(network, { GRASS_WET: 'F' }, given).toFixed(4)).toBe('0.6400')
}

const infersGiveGrassWetTrue = (infer: IInfer) => {
  const given = { GRASS_WET: 'T' }

  expect(infer(network, { RAIN: 'T' }, given).toFixed(4)).toBe('0.3577')
  expect(infer(network, { RAIN: 'F' }, given).toFixed(4)).toBe('0.6423')
  expect(infer(network, { SPRINKLER: 'T' }, given).toFixed(4)).toBe('0.6467')
  expect(infer(network, { SPRINKLER: 'F' }, given).toFixed(4)).toBe('0.3533')
}

const infersGiveGrassWetFalse = (infer: IInfer) => {
  const given = { GRASS_WET: 'F' }

  expect(infer(network, { RAIN: 'T' }, given).toFixed(4)).toBe('0.0718')
  expect(infer(network, { RAIN: 'F' }, given).toFixed(4)).toBe('0.9282')
  expect(infer(network, { SPRINKLER: 'T' }, given).toFixed(4)).toBe('0.0580')
  expect(infer(network, { SPRINKLER: 'F' }, given).toFixed(4)).toBe('0.9420')
}

const inferencesNames: { [key: string]: IInfer } = {
  Enumeration: enumeration.infer,
  'Junction Tree': junctionTree.infer,
  'Variable Elimination': variableElimination.infer,
}

const tests: { [key: string]: (infer: IInfer) => void } = {
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
