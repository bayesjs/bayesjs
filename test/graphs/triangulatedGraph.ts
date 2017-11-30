import * as expect from 'expect';
import { buildTriangulatedGraph, buildMoralGraph } from '../../src/graphs';
import { rain, sprinkler, grassWet } from '../../models/rain-sprinkler-grasswet';
import { createNetwork } from '../../src/utils';

const network = createNetwork(rain, sprinkler, grassWet);

describe('graphs', () => {
  describe('triangulatedGraph', () => {
    it('should not be null or undefined', () => {
      const moralGraph = buildMoralGraph(network);
      const triangulatedGraph = buildTriangulatedGraph(moralGraph);

      expect(triangulatedGraph).toBeTruthy();
    });
  });
});