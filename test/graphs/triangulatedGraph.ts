import * as expect from 'expect';
import { buildTriangulatedGraph, buildMoralGraph } from '../../src/graphs';
import { allNodes } from '../../models/rain-sprinkler-grasswet';
import { createNetwork } from '../../src/utils';

describe('graphs', () => {
  describe('triangulatedGraph', () => {
    it('should not be null or undefined', () => {
      const network = createNetwork(...allNodes);
      const moralGraph = buildMoralGraph(network);
      const triangulatedGraph = buildTriangulatedGraph(moralGraph);

      expect(triangulatedGraph).toBeTruthy();
    });
  });
});