import * as expect from 'expect';
import { createGraph, buildJunctionTree, buildMoralGraph, buildTriangulatedGraph } from '../../src/graphs';
import { createNetwork } from '../../src/utils/index';
import { allNodes } from '../../models/rain-sprinkler-grasswet';
import { buildCliqueGraph } from '../../src/graphs/cliqueGraph';

describe('graphs', () => {
  describe('junctionTreeGraph', () => {
    it('should not be null or undefined', () => {
      const network = createNetwork(...allNodes);
      const moralGraph = buildMoralGraph(network);
      const triangulatedGraph = buildTriangulatedGraph(moralGraph);
      const { cliqueGraph, cliques, sepSets } = buildCliqueGraph(triangulatedGraph);
      const jtGraph = buildJunctionTree(cliqueGraph, cliques, sepSets);

      expect(jtGraph).toBeTruthy();
    });
  });
});