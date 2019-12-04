import * as expect from 'expect'

import { buildJunctionTree, buildMoralGraph, buildTriangulatedGraph } from '../../src/graphs'

import { allNodes } from '../../models/rain-sprinkler-grasswet'
import { buildCliqueGraph } from '../../src/graphs/cliqueGraph'
import { createNetwork } from '../../src/utils'

describe('graphs', () => {
  describe('junctionTreeGraph', () => {
    it('should not be null or undefined', () => {
      const network = createNetwork(...allNodes)
      const moralGraph = buildMoralGraph(network)
      const triangulatedGraph = buildTriangulatedGraph(moralGraph)
      const { cliqueGraph, cliques, sepSets } = buildCliqueGraph(triangulatedGraph)
      const jtGraph = buildJunctionTree(cliqueGraph, cliques, sepSets)

      expect(jtGraph).toBeTruthy()
    })
  })
})
