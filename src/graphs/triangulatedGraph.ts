import { IGraph } from '../types/index';

export const buildTriangulatedGraph = (moralGraph: IGraph) => {
  const triangulatedGraph = moralGraph.clone();
  const clonedGraph = triangulatedGraph.clone();
  const nodes = clonedGraph.getNodesId();
  const nodesToRemove = [ ...nodes ];

  const findLessNeighbors = () => {
    if (nodesToRemove.length == 1) return nodesToRemove.shift();
    let index = 0;
    let candidateNeighbors = clonedGraph.getNeighborsOf(nodesToRemove[index]);

    for (let i = 1; i < nodesToRemove.length; i++) {
      const node = nodesToRemove[i];
      const neighbors = clonedGraph.getNeighborsOf(node);

      if (neighbors.length < candidateNeighbors.length) {
        index = i;
        candidateNeighbors = neighbors;
      }
    }

    const node = nodesToRemove[index];
    nodesToRemove.splice(index, 1);
    return node;
  };

  while (nodesToRemove.length > 0) {
    const nodeToRemove = findLessNeighbors();
    const neighbors = clonedGraph.getNeighborsOf(nodeToRemove).filter(id => nodesToRemove.indexOf(id) > -1);
    
    for (let i = 0; i < neighbors.length; i++) {
      for (let j = i + 1; j < neighbors.length; j++) {
        const neighborA = neighbors[i];
        const neighborB = neighbors[j];

        if (!clonedGraph.containsNodeId(neighborA) || !clonedGraph.containsNodeId(neighborB)) {
          continue;
        }

        if (!clonedGraph.areConnected(neighborA, neighborB)) {
          clonedGraph.addEdge(neighborA, neighborB);
          triangulatedGraph.addEdge(neighborA, neighborB);
        }
      }
    }
    
    clonedGraph.removeNodeId(nodeToRemove);
  }

  return triangulatedGraph;
};