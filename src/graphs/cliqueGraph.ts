import { IClique, ISepSet, IGraph, INetwork, ICliqueGraph, INodeList } from '../types/index';
import { isEqual } from 'lodash';
import { createGraph } from './index';

const createCliques = (graph: IGraph) => {
  const nodes = graph.getNodesId();
  const cliques: IClique[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const clique = [ nodes[i] ];

    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;
      // else if (intersection(net[nodes[i]].network, net[nodes[j]].network).length > 0) continue;
      // else if (net[nodes[i]].network !== net[nodes[j]].network) continue;

      if (clique.every(node => graph.areConnected(node, nodes[j]))) {
        clique.push(nodes[j]);
      }
    }

    clique.sort();

    if (!cliques.some(x => isEqual(x.clique, clique))) {
      cliques.push({
        id: cliques.length.toString(),
        clique
      });
    }
  }

  return cliques;
};

export const buildCliqueGraph = (triangulatedGraph: IGraph): ICliqueGraph => {
  const cliqueGraph = createGraph();
  const cliques = createCliques(triangulatedGraph);
  const sepSets: ISepSet[] = [];

  for (let i = 0; i < cliques.length; i++) {
    cliqueGraph.addNodeId(cliques[i].id);

    for (let j = i + 1; j < cliques.length; j++) {
      if (i === j) {
        continue;
      }

      const sharedNodes = [];

      for (let k = 0; k < cliques[j].clique.length; k++) {
        if (cliques[i].clique.some(x => x === cliques[j].clique[k])) {
          sharedNodes.push(cliques[j].clique[k]);
        }
      }

      if (sharedNodes.length > 0) {
        cliqueGraph.addEdge(cliques[i].id, cliques[j].id);
        sepSets.push({ ca: cliques[i].id, cb: cliques[j].id, sharedNodes });
      }
    }
  }

  return {
    cliqueGraph,
    cliques,
    sepSets
  };
};