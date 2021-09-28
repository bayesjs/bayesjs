import * as expect from 'expect'

import { allNodes } from '../../models/alarm'
import { createNetwork } from '../../src/utils'
import { allNodes as hugeNetworkAllNodes } from '../../models/huge-network'
import { HuginInferenceEngine } from '../../src/inferences/junctionTree/hugin-inference-engine'

const network = createNetwork(...allNodes)
const hugeNetwork = createNetwork(...hugeNetworkAllNodes)
const engine = new HuginInferenceEngine(network)
const hugeEngine = new HuginInferenceEngine(hugeNetwork)

describe('InferAll Utils', () => {
  describe('After mutating the distribution', () => {
    engine.setEvidence({ EARTHQUAKE: 'T' })

    it("returns inference result for all node's state", () => {
      engine.inferAll() // infer to cache

      // change network by mutation
      engine.setDistribution('JOHN_CALLS', [
        { when: { ALARM: 'T' }, then: { T: 0.1, F: 0.9 } },
        { when: { ALARM: 'F' }, then: { T: 0.95, F: 0.05 } },
      ])

      expect(engine.inferAll({ precision: 8 })).toEqual({
        BURGLARY: {
          T: 0.001,
          F: 0.999,
        },
        EARTHQUAKE: {
          T: 1,
          F: 0,
        },
        ALARM: {
          T: 0.29066,
          F: 0.70934,
        },
        JOHN_CALLS: {
          T: 0.702939,
          F: 0.297061,
        },
        MARY_CALLS: {
          T: 0.2105554,
          F: 0.7894446,
        },
      })
    })
  })

  describe('When option "precision" changes', () => {
    describe('to 4', () => {
      describe('With alarm network', () => {
        describe('No evidences', () => {
          it("returns inference result for all node's state", () => {
            engine.removeAllEvidence()
            engine.setDistribution('JOHN_CALLS', network.JOHN_CALLS.cpt)

            expect(engine.inferAll({ precision: 4 })).toEqual({
              BURGLARY: { T: 0.001, F: 0.999 },
              EARTHQUAKE: { T: 0.002, F: 0.998 },
              ALARM: { T: 0.0025, F: 0.9975 },
              JOHN_CALLS: { T: 0.0521, F: 0.9479 },
              MARY_CALLS: { T: 0.0117, F: 0.9883 },
            })
          })
        })
      })
    })

    describe('to 2', () => {
      describe('With alarm network', () => {
        describe('No evidences', () => {
          it("returns inference result for all node's state", () => {
            expect(engine.inferAll({ precision: 2 })).toEqual({
              BURGLARY: { T: 0, F: 1 },
              EARTHQUAKE: { T: 0, F: 1 },
              ALARM: { T: 0, F: 1 },
              JOHN_CALLS: { T: 0.05, F: 0.95 },
              MARY_CALLS: { T: 0.01, F: 0.99 },
            })
          })
        })
      })
    })
  })

  describe('When no options is passed', () => {
    describe('With alarm network', () => {
      describe('No evidences', () => {
        it("returns inference result for all node's state", () => {
          expect(engine.inferAll({ precision: 8 })).toEqual({
            BURGLARY: { T: 0.001, F: 0.999 },
            EARTHQUAKE: { T: 0.002, F: 0.998 },
            ALARM: { T: 0.00251644, F: 0.99748356 },
            JOHN_CALLS: { T: 0.05213898, F: 0.94786102 },
            MARY_CALLS: { T: 0.01173634, F: 0.98826366 },
          })
        })
      })

      describe('Burglary True', () => {
        it("returns inference result for all node's state", () => {
          engine.setEvidence({ BURGLARY: 'T' })
          expect(engine.inferAll({ precision: 8 })).toEqual({
            BURGLARY: { T: 1, F: 0 },
            EARTHQUAKE: { T: 0.002, F: 0.998 },
            ALARM: { T: 0.94002, F: 0.05998 },
            JOHN_CALLS: { T: 0.849017, F: 0.150983 },
            MARY_CALLS: { T: 0.6586138, F: 0.3413862 },
          })
        })
      })

      describe('Burglary True and Earthquake True', () => {
        it("returns inference result for all node's state", () => {
          engine.updateEvidence({ EARTHQUAKE: 'T' })
          expect(engine.inferAll({ precision: 8 })).toEqual({
            BURGLARY: { T: 1, F: 0 },
            EARTHQUAKE: { T: 1, F: 0 },
            ALARM: { T: 0.95, F: 0.05 },
            JOHN_CALLS: { T: 0.8575, F: 0.1425 },
            MARY_CALLS: { T: 0.6655, F: 0.3345 },
          })
        })
      })
    })

    describe('With huge network', () => {
      describe('No evidences', () => {
        it("returns inference result for all node's state", () => {
          expect(hugeEngine.inferAll({ precision: 8 })).toEqual({
            node1: { T: 0.98019999, F: 0.01980001 },
            node2: { T: 0.99, F: 0.01 },
            node3: { T: 0.99, F: 0.01 },
            node4: { T: 0.99, F: 0.01 },
            node5: { T: 0.99, F: 0.01 },
            node6: { T: 0.99, F: 0.01 },
            node7: { T: 0.99, F: 0.01 },
            node8: { T: 0.99, F: 0.01 },
            node9: { T: 0.99, F: 0.01 },
            node10: { T: 0.989902, F: 0.010098 },
            node11: { T: 0.99, F: 0.01 },
            node12: { T: 0.99, F: 0.01 },
            node13: { T: 0.989902, F: 0.010098 },
            node14: { T: 0.99, F: 0.01 },
            node15: { T: 0.99, F: 0.01 },
            node16: { T: 0.99, F: 0.01 },
            node17: { T: 0.989902, F: 0.010098 },
            node18: { T: 0.98999999, F: 0.01000001 },
            node19: { T: 0.99, F: 0.01 },
            node20: { T: 0.99, F: 0.01 },
            node21: { T: 0.99, F: 0.01 },
            node22: { T: 0.99, F: 0.01 },
            node23: { T: 0.99, F: 0.01 },
            node24: { T: 0.0198, F: 0.9802 },
            node25: { T: 0.99, F: 0.01 },
            node26: { T: 0.99, F: 0.01 },
            node27: { T: 0.99, F: 0.01 },
            node28: { T: 0.99, F: 0.01 },
            node29: { T: 0.99, F: 0.01 },
            node30: { T: 0.99, F: 0.01 },
            node31: { T: 0.98029799, F: 0.01970201 },
            node32: { T: 0.98029799, F: 0.01970201 },
            node33: { T: 0.98029799, F: 0.01970201 },
            node34: { T: 0.98029799, F: 0.01970201 },
            node35: { T: 0.98029799, F: 0.01970201 },
            node36: { T: 0, F: 1 },
            node37: { T: 0.98990103, F: 0.01009897 },
            node38: { T: 0.98990104, F: 0.01009896 },
            node39: { T: 0.99, F: 0.01 },
          })
        })
      })
    })
  })
})
