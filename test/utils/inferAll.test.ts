import * as expect from 'expect'

import { allNodes } from '../../models/alarm'
import { clone } from 'ramda'
import { createNetwork } from '../../src/utils'
import { allNodes as hugeNetworkAllNodes } from '../../models/huge-network'
import { inferAll } from '../../src/utils/inferAll'

const network = createNetwork(...allNodes)
const hugeNetwork = createNetwork(...hugeNetworkAllNodes)

describe('InferAll Utils', () => {
  describe('When option "force" is true', () => {
    const networkCloned = clone(network)
    const given = { EARTHQUAKE: 'T' }

    it('returns inference result for all node states', () => {
      inferAll(networkCloned, given) // infer to cache

      // change network by mutation
      networkCloned.JOHN_CALLS.cpt = [
        { when: { ALARM: 'T' }, then: { T: 0.1, F: 0.9 } },
        { when: { ALARM: 'F' }, then: { T: 0.95, F: 0.05 } },
      ]

      expect(inferAll(networkCloned, given, { force: true })).toEqual({
        BURGLARY: {
          T: 0.0009999999999999998,
          F: 0.9989999999999999,
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
          T: 0.21055539999999998,
          F: 0.7894445999999999,
        },
      })
    })
  })

  describe('When no options is passed', () => {
    describe('With alarm network', () => {
      describe('No evidences', () => {
        it('returns inference result for all node states', () => {
          expect(inferAll(network)).toEqual({
            BURGLARY: {
              T: 0.0009999999999999998,
              F: 0.999,
            },
            EARTHQUAKE: {
              T: 0.002,
              F: 0.998,
            },
            ALARM: {
              T: 0.0025164420000000002,
              F: 0.997483558,
            },
            JOHN_CALLS: {
              T: 0.052138975700000006,
              F: 0.9478610243,
            },
            MARY_CALLS: {
              T: 0.01173634498,
              F: 0.98826365502,
            },
          })
        })
      })

      describe('Burglary True', () => {
        it('returns inference result for all node states', () => {
          expect(inferAll(network, { BURGLARY: 'T' })).toEqual({
            BURGLARY: {
              T: 1,
              F: 0,
            },
            EARTHQUAKE: {
              T: 0.002,
              F: 0.9980000000000002,
            },
            ALARM: {
              T: 0.9400200000000001,
              F: 0.05998,
            },
            JOHN_CALLS: {
              T: 0.849017,
              F: 0.150983,
            },
            MARY_CALLS: {
              T: 0.6586138000000001,
              F: 0.34138620000000003,
            },
          })
        })
      })

      describe('Burglary True and Earthquake True', () => {
        it('returns inference result for all node states', () => {
          expect(inferAll(network, { BURGLARY: 'T', EARTHQUAKE: 'T' })).toEqual({
            BURGLARY: {
              T: 1,
              F: 0,
            },
            EARTHQUAKE: {
              T: 1,
              F: 0,
            },
            ALARM: {
              T: 0.95,
              F: 0.05,
            },
            JOHN_CALLS: {
              T: 0.8574999999999999,
              F: 0.14250000000000002,
            },
            MARY_CALLS: {
              T: 0.6655,
              F: 0.3345,
            },
          })
        })
      })
    })

    describe('With huge network', () => {
      describe('No evidences', () => {
        it('returns inference result for all node states', () => {
          expect(inferAll(hugeNetwork)).toEqual({
            node1: {
              T: 0.9801999899129571,
              F: 0.01980001008704279,
            },
            node2: {
              T: 0.9899999999999903,
              F: 0.010000000000009748,
            },
            node3: {
              T: 0.9899999999999971,
              F: 0.009999999999999917,
            },
            node4: {
              T: 0.9899999999999971,
              F: 0.009999999999999917,
            },
            node5: {
              T: 0.9899999999999971,
              F: 0.009999999999999917,
            },
            node6: {
              T: 0.9899999999999971,
              F: 0.009999999999999917,
            },
            node7: {
              T: 0.9899999999999971,
              F: 0.009999999999999917,
            },
            node8: {
              T: 0.9899999999999971,
              F: 0.009999999999999917,
            },
            node9: {
              T: 0.9899999999999971,
              F: 0.009999999999999915,
            },
            node10: {
              T: 0.9899019999999998,
              F: 0.010098,
            },
            node11: {
              T: 0.9899999999999998,
              F: 0.01,
            },
            node12: {
              T: 0.9899999999999998,
              F: 0.01,
            },
            node13: {
              T: 0.989902,
              F: 0.010097999999999994,
            },
            node14: {
              T: 0.9899999999999999,
              F: 0.01,
            },
            node15: {
              T: 0.9899999999999999,
              F: 0.01,
            },
            node16: {
              T: 0.9900000000000001,
              F: 0.010000000000000002,
            },
            node17: {
              T: 0.98990199990396,
              F: 0.010098000096039988,
            },
            node18: {
              T: 0.9899999902,
              F: 0.010000009800000003,
            },
            node19: {
              T: 0.9899999999999997,
              F: 0.009999999999999997,
            },
            node20: {
              T: 0.9899999999999997,
              F: 0.009999999999999997,
            },
            node21: {
              T: 0.9899999999999997,
              F: 0.009999999999999997,
            },
            node22: {
              T: 0.9899999999999997,
              F: 0.009999999999999997,
            },
            node23: {
              T: 0.99,
              F: 0.010000000000000002,
            },
            node24: {
              T: 0.01979999999512076,
              F: 0.9802000000048792,
            },
            node25: {
              T: 0.9899999999019996,
              F: 0.01000000009799998,
            },
            node26: {
              T: 0.9899999999999997,
              F: 0.00999999999999998,
            },
            node27: {
              T: 0.9899999999999997,
              F: 0.00999999999999998,
            },
            node28: {
              T: 0.9899999999999997,
              F: 0.00999999999999998,
            },
            node29: {
              T: 0.9899999999999997,
              F: 0.00999999999999998,
            },
            node30: {
              T: 0.9899999999999997,
              F: 0.00999999999999998,
            },
            node31: {
              T: 0.9802979902088171,
              F: 0.019702009791182758,
            },
            node32: {
              T: 0.9802979902088171,
              F: 0.019702009791182758,
            },
            node33: {
              T: 0.9802979902088171,
              F: 0.019702009791182758,
            },
            node34: {
              T: 0.9802979902088171,
              F: 0.019702009791182758,
            },
            node35: {
              T: 0.9802979902088171,
              F: 0.019702009791182758,
            },
            node36: {
              T: 0,
              F: 1,
            },
            node37: {
              T: 0.98990103018808,
              F: 0.010098969811920004,
            },
            node38: {
              T: 0.9899010395999998,
              F: 0.010098960400000096,
            },
            node39: {
              T: 0.99,
              F: 0.010000000000000004,
            },
          })
        })
      })
    })
  })
})
