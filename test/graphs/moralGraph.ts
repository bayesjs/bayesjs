import * as expect from 'expect';
import { createGraph, buildMoralGraph } from '../../src/graphs';
import { rain, sprinkler, grassWet } from '../../models/rain-sprinkler-grasswet';
import { createNetwork } from '../../src/utils';

const network = createNetwork(rain, sprinkler, grassWet);

describe('graphs', () => {
  describe('moralGraph', () => {
    it('should not be null or undefined', () => {
      const moralGraph = buildMoralGraph(network);

      expect(moralGraph).toBeTruthy();
    });
  });
});