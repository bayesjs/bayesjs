import * as expect from 'expect';
import { rain, sprinkler, grassWet } from '../../models/rain-sprinkler-grasswet';
import { addNode } from '../../src/index';
import { createNetwork, networkToNodeList } from '../../src/utils';

describe('utils', () => {
  describe('network', () => {
    it('createNetwork should works', () => {
      const net = createNetwork(rain, sprinkler, grassWet);
      let network = {};
      
      network = addNode(network, rain);
      network = addNode(network, sprinkler);
      network = addNode(network, grassWet);

      expect(net).toEqual(network);      
    });

    it('networkToNodeList should works', () => {
      const net = createNetwork(rain, sprinkler, grassWet);
      const nodeList = [rain, sprinkler, grassWet];
      const result = networkToNodeList(net);

      expect(result).toEqual(nodeList);      
    });
  });
});