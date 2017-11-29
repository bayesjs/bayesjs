import { INetwork, IGraph } from '../types/index';
import { createGraph } from './graph';
import { networkToNodeList } from '../utils/index';

export const buildMoralGraph = (network: INetwork): IGraph => {
  const nodes = networkToNodeList(network);
  const moralGraph = createGraph();

  for (const node of nodes) {
    moralGraph.addNodeId(node.id);

    for (const parentId of node.parents) {
      moralGraph.addEdge(parentId, node.id);
    }
  }

  for (const node of nodes) {
    for (let i = 0; i < node.parents.length; i++) {
      for (let j = i + 1; j < node.parents.length; j++) {
        if (!moralGraph.areConnected(node.parents[i], node.parents[j])) {
          moralGraph.addEdge(node.parents[i], node.parents[j]);
        }
      }
    }
  }

  return moralGraph;
};