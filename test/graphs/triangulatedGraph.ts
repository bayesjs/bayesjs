import * as expect from 'expect';
import { cloneDeep } from 'lodash';
import { createGraph, buildTriangulatedGraph, buildMoralGraph } from '../../src/graphs';
import { rain, sprinkler, grassWet } from '../../models/rain-sprinkler-grasswet';
import { createNetwork } from '../../src/utils';

const network = createNetwork(rain, sprinkler, grassWet);

describe('graphs', () => {
  describe('triangulatedGraph', () => {
    it('should not be null or undefined', () => {
      const triangulatedGraph = buildMoralGraph(network);

      expect(triangulatedGraph).toBeTruthy();
    });
  });
});