import * as expect from 'expect'

import { network } from '../../models/asia'
import { InferenceEngine } from '../../src/index'
import roundTo = require('round-to')

describe('Asia Network', () => {
  describe('without evidence, marginal distribution', () => {
    const engine = new InferenceEngine(network)
    const infer = (event: Record<string, string[]>) => roundTo(engine.infer(event), 4)
    it('is infered correctly for Visit to Asia', () => {
      expect(infer({ VisitToAsia: ['T'] })).toEqual(0.01)
      expect(infer({ VisitToAsia: ['F'] })).toEqual(0.99)
    })
    it('is infered correctly for Tuberculosis', () => {
      expect(infer({ Tuberculosis: ['T'] })).toEqual(0.0104)
      expect(infer({ Tuberculosis: ['F'] })).toEqual(0.9896)
    })
    it('is infered correctly for Smoker', () => {
      expect(infer({ Smoker: ['T'] })).toEqual(0.5)
      expect(infer({ Smoker: ['F'] })).toEqual(0.5)
    })
    it('is infered correctly for LungCancer', () => {
      expect(infer({ LungCancer: ['T'] })).toEqual(0.055)
      expect(infer({ LungCancer: ['F'] })).toEqual(0.945)
    })
    it('is infered correctly for TbOrCa', () => {
      expect(infer({ TbOrCa: ['T'] })).toEqual(0.0648)
      expect(infer({ TbOrCa: ['F'] })).toEqual(0.9352)
    })
    it('is infered correctly for AbnormalXRay', () => {
      expect(infer({ AbnormalXRay: ['T'] })).toEqual(0.1103)
      expect(infer({ AbnormalXRay: ['F'] })).toEqual(0.8897)
    })
    it('is infered correctly for Bronchitis', () => {
      expect(infer({ Bronchitis: ['T'] })).toEqual(0.45)
      expect(infer({ Bronchitis: ['F'] })).toEqual(0.55)
    })
    it('is infered correctly for Dyspnea', () => {
      expect(infer({ Dyspnea: ['T'] })).toEqual(0.4360)
      expect(infer({ Dyspnea: ['F'] })).toEqual(0.5640)
    })
  })
  describe('with evidence, marginal distribution', () => {
    const engine = new InferenceEngine(network)
    engine.setEvidence({ VisitToAsia: ['T'] })
    const infer = (event: Record<string, string[]>) => roundTo(engine.infer(event), 4)
    it('is infered correctly for Visit to Asia', () => {
      expect(infer({ VisitToAsia: ['T'] })).toEqual(1)
      expect(infer({ VisitToAsia: ['F'] })).toEqual(0)
    })
    it('is infered correctly for Tuberculosis', () => {
      expect(infer({ Tuberculosis: ['T'] })).toEqual(0.05)
      expect(infer({ Tuberculosis: ['F'] })).toEqual(0.95)
    })
    it('is infered correctly for Smoker', () => {
      expect(infer({ Smoker: ['T'] })).toEqual(0.5)
      expect(infer({ Smoker: ['F'] })).toEqual(0.5)
    })
    it('is infered correctly for LungCancer', () => {
      expect(infer({ LungCancer: ['T'] })).toEqual(0.055)
      expect(infer({ LungCancer: ['F'] })).toEqual(0.945)
    })
    it('is infered correctly for TbOrCa', () => {
      expect(infer({ TbOrCa: ['T'] })).toEqual(0.1023)
      expect(infer({ TbOrCa: ['F'] })).toEqual(0.8977)
    })
    it('is infered correctly for AbnormalXRay', () => {
      expect(infer({ AbnormalXRay: ['T'] })).toEqual(0.1451)
      expect(infer({ AbnormalXRay: ['F'] })).toEqual(0.8549)
    })
    it('is infered correctly for Bronchitis', () => {
      expect(infer({ Bronchitis: ['T'] })).toEqual(0.45)
      expect(infer({ Bronchitis: ['F'] })).toEqual(0.55)
    })
    it('is infered correctly for Dyspnea', () => {
      expect(infer({ Dyspnea: ['T'] })).toEqual(0.4501)
      expect(infer({ Dyspnea: ['F'] })).toEqual(0.5499)
    })
  })
})
