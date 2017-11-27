import * as expect from 'expect';
import { createGraph } from '../../src/graphs/graph';

describe('graphs', () => {
  describe('graph', () => {
    it('should not be null or undefined', () => {
      const graph = createGraph();

      expect(graph).toBeTruthy()
    });
  });
});