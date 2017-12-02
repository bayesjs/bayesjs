import { IClique, ISepSet, IGraph, INetwork, ICliqueGraph, INodeList } from '../types/index';
import { isEqual } from 'lodash';
import { createGraph } from './index';
import { findCliques } from '../utils/bronKerbosch';

export const buildCliqueGraph = (triangulatedGraph: IGraph): ICliqueGraph => {
  const cliqueGraph = createGraph();
  const cliques = findCliques(triangulatedGraph);
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