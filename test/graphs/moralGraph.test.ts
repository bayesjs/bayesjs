import * as expect from 'expect'
import { buildMoralGraph } from '../../src/graphs'
import { allNodes } from '../../models/rain-sprinkler-grasswet'
import { createNetwork } from '../../src/utils'

describe('graphs', () => {
  describe('moralGraph', () => {
    it('should not be null or undefined', () => {
      const network = createNetwork(...allNodes)
      const moralGraph = buildMoralGraph(network)

      expect(moralGraph).toBeTruthy()
    })
  })
})
