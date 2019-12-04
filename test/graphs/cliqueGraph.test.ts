import * as expect from 'expect'

import { alarm, burglary, earthquake, johnCalls, maryCalls } from '../../models/alarm'
import { buildMoralGraph, buildTriangulatedGraph } from '../../src/graphs'
import { grassWet, rain, sprinkler } from '../../models/rain-sprinkler-grasswet'

import { INetwork } from '../../src/types'
import { buildCliqueGraph } from '../../src/graphs/cliqueGraph'
import { createNetwork } from '../../src/utils'

const getTriangulatedGraph = (network: INetwork) => {
  const moralGraph = buildMoralGraph(network)
  return buildTriangulatedGraph(moralGraph)
}

describe('graphs', () => {
  describe('cliqueGraph', () => {
    it('should not be null or undefined', () => {
      const network = createNetwork(rain, sprinkler, grassWet)
      const triangulatedGraph = getTriangulatedGraph(network)
      const cliqueGraph = buildCliqueGraph(triangulatedGraph)

      expect(cliqueGraph).toBeTruthy()
    })

    it('should create 1 cliques in sprinkler network', () => {
      const network = createNetwork(rain, sprinkler, grassWet)
      const triangulatedGraph = getTriangulatedGraph(network)
      const { cliques } = buildCliqueGraph(triangulatedGraph)

      expect(cliques.length).toBe(1)
    })

    it('should create 0 sepsets in sprinkler network', () => {
      const network = createNetwork(rain, sprinkler, grassWet)
      const triangulatedGraph = getTriangulatedGraph(network)
      const { sepSets } = buildCliqueGraph(triangulatedGraph)

      expect(sepSets.length).toBe(0)
    })

    it('should create 3 cliques in alarm network', () => {
      const network = createNetwork(burglary, earthquake, alarm, johnCalls, maryCalls)
      const triangulatedGraph = getTriangulatedGraph(network)
      const { cliques } = buildCliqueGraph(triangulatedGraph)

      expect(cliques.length).toBe(3)
    })

    it('should create 3 sepsets in alarm network', () => {
      const network = createNetwork(burglary, earthquake, alarm, johnCalls, maryCalls)
      const triangulatedGraph = getTriangulatedGraph(network)
      const { sepSets } = buildCliqueGraph(triangulatedGraph)

      expect(sepSets.length).toBe(3)
    })
  })
})
