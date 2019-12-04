import * as expect from 'expect'
import { buildCombinations, createNetwork } from '../../src/utils'
import { allNodes } from '../../models/rain-sprinkler-grasswet'

describe('utils', () => {
  describe('combinations', () => {
    it('buildCombinations with sprinkler network', () => {
      const network = createNetwork(...allNodes)
      const combinations = buildCombinations(network)

      expect(combinations).toEqual(
        [
          {
            RAIN: 'T',
            SPRINKLER: 'T',
            GRASS_WET: 'T',
          },
          {
            RAIN: 'T',
            SPRINKLER: 'T',
            GRASS_WET: 'F',
          },
          {
            RAIN: 'T',
            SPRINKLER: 'F',
            GRASS_WET: 'T',
          },
          {
            RAIN: 'T',
            SPRINKLER: 'F',
            GRASS_WET: 'F',
          },
          {
            RAIN: 'F',
            SPRINKLER: 'T',
            GRASS_WET: 'T',
          },
          {
            RAIN: 'F',
            SPRINKLER: 'T',
            GRASS_WET: 'F',
          },
          {
            RAIN: 'F',
            SPRINKLER: 'F',
            GRASS_WET: 'T',
          },
          {
            RAIN: 'F',
            SPRINKLER: 'F',
            GRASS_WET: 'F',
          },
        ],
      )
    })

    it('buildCombinations with sprinkler network given nodes to combine (RAIN, SPRINKLER)', () => {
      const network = createNetwork(...allNodes)
      const combinations = buildCombinations(network, ['RAIN', 'SPRINKLER'])

      expect(combinations).toEqual(
        [
          {
            RAIN: 'T',
            SPRINKLER: 'T',
          },
          {
            RAIN: 'T',
            SPRINKLER: 'F',
          },
          {
            RAIN: 'F',
            SPRINKLER: 'T',
          },
          {
            RAIN: 'F',
            SPRINKLER: 'F',
          },
        ],
      )
    })

    it('buildCombinations with sprinkler network given nodes to combine (RAIN, GRASS_WET)', () => {
      const network = createNetwork(...allNodes)
      const combinations = buildCombinations(network, ['RAIN', 'GRASS_WET'])

      expect(combinations).toEqual(
        [
          {
            RAIN: 'T',
            GRASS_WET: 'T',
          },
          {
            RAIN: 'T',
            GRASS_WET: 'F',
          },
          {
            RAIN: 'F',
            GRASS_WET: 'T',
          },
          {
            RAIN: 'F',
            GRASS_WET: 'F',
          },
        ],
      )
    })

    it('buildCombinations with sprinkler network given nodes to combine (RAIN)', () => {
      const network = createNetwork(...allNodes)
      const combinations = buildCombinations(network, ['RAIN'])

      expect(combinations).toEqual(
        [
          {
            RAIN: 'T',
          },
          {
            RAIN: 'F',
          },
        ],
      )
    })
  })
})
