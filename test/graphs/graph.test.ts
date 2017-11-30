import * as expect from 'expect';
import { createGraph } from '../../src/graphs/graph';
import { createNetwork } from '../../src/utils/index';
import { rain, sprinkler, grassWet } from '../../models/rain-sprinkler-grasswet';

describe('graphs', () => {
  describe('graph', () => {
    it('should not be null or undefined', () => {
      const graph = createGraph();

      expect(graph).toBeTruthy()
    });

    it('should create a empty graph', () => {
      const graph = createGraph();
      const nodeIds = graph.getNodesId();
      const edges = graph.getEdges();
      
      expect(nodeIds.length).toBe(0);
      expect(edges.length).toBe(0);
    });

    it('should create a graph given a network', () => {
      const network = createNetwork(rain, sprinkler, grassWet);
      const graph = createGraph(network);
      const nodeIds = graph.getNodesId();
      const edges = graph.getEdges();

      expect(nodeIds).toEqual(['RAIN', 'SPRINKLER', 'GRASS_WET']);
      expect(edges.length).toBe(3);
    });
  });
});