import * as expect from 'expect'
import { buildTriangulatedGraph, buildMoralGraph } from '../../src/graphs'
import { rain, sprinkler, grassWet } from '../../models/rain-sprinkler-grasswet'
import { burglary, earthquake, alarm, johnCalls, maryCalls } from '../../models/alarm'
import { createNetwork } from '../../src/utils'

describe('graphs', () => {
  describe('triangulatedGraph', () => {
    it('should not be null or undefined', () => {
      const network = createNetwork(rain, sprinkler, grassWet)
      const moralGraph = buildMoralGraph(network)
      const triangulatedGraph = buildTriangulatedGraph(moralGraph)

      expect(triangulatedGraph).toBeTruthy()
    })

    it('all nodes should be connected in sprinkler network', () => {
      const network = createNetwork(rain, sprinkler, grassWet)
      const moralGraph = buildMoralGraph(network)
      const { areConnected } = buildTriangulatedGraph(moralGraph)

      expect(areConnected(rain.id, sprinkler.id)).toBeTruthy()
      expect(areConnected(rain.id, grassWet.id)).toBeTruthy()
      expect(areConnected(grassWet.id, sprinkler.id)).toBeTruthy()
    })

    it('check connected nodes in alarm network', () => {
      const network = createNetwork(burglary, earthquake, alarm, johnCalls, maryCalls)
      const moralGraph = buildMoralGraph(network)
      const { areConnected } = buildTriangulatedGraph(moralGraph)

      expect(areConnected(burglary.id, earthquake.id)).toBeTruthy()
      expect(areConnected(alarm.id, earthquake.id)).toBeTruthy()
      expect(areConnected(burglary.id, alarm.id)).toBeTruthy()
      expect(areConnected(alarm.id, johnCalls.id)).toBeTruthy()
      expect(areConnected(alarm.id, maryCalls.id)).toBeTruthy()
    })
  })
})
