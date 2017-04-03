import isEqual from 'lodash/isequal';

// export function infer(network, nodes, given) {
export function infer(_, __, ___) {
  const network = {
    B: {
      id: 'B',
      parents: []
    },
    E: {
      id: 'E',
      parents: []
    },
    A: {
      id: 'A',
      parents: [ 'B', 'E' ]
    },
    J: {
      id: 'J',
      parents: [ 'A' ]
    },
    M: {
      id: 'M',
      parents: [ 'A' ]
    }
  };

  const moralGraph = buildMoralGraph(network);
  console.log('MORAL GRAPH');
  moralGraph.print();
  console.log();

  const triangulatedGraph = buildTriangulatedGraph(moralGraph);
  console.log('TRIANGULATED GRAPH');
  triangulatedGraph.print();
  console.log();

  const { cliqueGraph, cliques, sepSets } = buildCliqueGraph(triangulatedGraph);
  console.log('CLIQUE GRAPH');
  cliqueGraph.print();
  console.log('cliques');
  console.dir(cliques);
  console.log('sepSets');
  console.dir(sepSets);
  console.log();

  const junctionTree = buildJunctionTree(cliqueGraph, cliques, sepSets);
  console.log('JUNCTION TREE');
  junctionTree.print();
  console.log('cliques');
  console.dir(cliques);
  console.log('sepSets');
  console.dir(sepSets);
  console.log();

  return 0;
}

const buildJunctionTree = (cliqueGraph, cliques, sepSets) => {
  sepSets.sort((a, b) => b.sharedNodes.length - a.sharedNodes.length);

  const spanningTree = [];

  const hasCycle = () => {
    const visited = {};

    const visit = (cliqueId, parentId) => {
      visited[cliqueId] = true;

      const adjsA = spanningTree
        .filter(x => x.ca === cliqueId)
        .map(x => x.cb);

      const adjsB = spanningTree
        .filter(x => x.cb === cliqueId)
        .map(x => x.ca);

      const adjs = adjsA.concat(adjsB);

      for (const adj of adjs) {
        if (!visited[adj]) {
          if (visit(adj, cliqueId)) {
            return true;
          }
        } else if (adj !== parentId) {
          return true;
        }
      }

      return false;
    };

    for (let i = 0; i < cliques.length; i++) {
      visited[cliques[i].id] = false;
    }

    for (let i = 0; i < cliques.length; i++) {
      if (!visited[cliques[i].id]) {
        if (visit(cliques[i].id, null)) {
          return true;
        }
      }
    }

    return false;
  };

  for (let i = 0; i < sepSets.length; i++) {
    spanningTree.push(sepSets[i]);

    if (hasCycle()) {
      spanningTree.pop();
    }
  }

  const junctionTree = cliqueGraph.clone();

  for (let i = sepSets.length - 1; i >= 0; i--) {
    const shouldRemove = !spanningTree.some(x => x === sepSets[i]);

    if (shouldRemove) {
      junctionTree.removeEdge(sepSets[i].ca, sepSets[i].cb);
      sepSets.splice(i, 1);
    }
  }

  return junctionTree;
};

const buildCliqueGraph = triangulatedGraph => {
  const cliqueGraph = createGraph();

  const cliques = [];
  const nodes = triangulatedGraph.getNodes();

  for (let i = 0; i < nodes.length; i++) {
    const clique = [ nodes[i] ];

    for (let j = 0; j < nodes.length; j++) {
      if (i === j) {
        continue;
      }

      if (clique.every(node => triangulatedGraph.areConnected(node, nodes[j]))) {
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

  const sepSets = [];

  for (let i = 0; i < cliques.length; i++) {
    cliqueGraph.addNode(cliques[i].id);

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

const buildTriangulatedGraph = moralGraph => {
  const triangulatedGraph = moralGraph.clone();
  const clonedGraph = triangulatedGraph.clone();

  const nodesToRemove = clonedGraph.getNodes()
    .map(node => {
      return {
        node,
        neighbors: clonedGraph.getNeighborsOf(node)
      };
    })
    .sort((a, b) => {
      return a.neighbors.length - b.neighbors.length;
    });

  while (nodesToRemove.length > 0) {
    const nodeToRemove = nodesToRemove.shift();

    for (let i = 0; i < nodeToRemove.neighbors.length; i++) {
      for (let j = i + 1; j < nodeToRemove.neighbors.length; j++) {
        const neighborA = nodeToRemove.neighbors[i];
        const neighborB = nodeToRemove.neighbors[j];

        if (!clonedGraph.containsNode(neighborA) || !clonedGraph.containsNode(neighborB)) {
          continue;
        }

        if (!clonedGraph.areConnected(neighborA, neighborB)) {
          clonedGraph.addEdge(neighborA, neighborB);
          triangulatedGraph.addEdge(neighborA, neighborB);
        }
      }
    }

    clonedGraph.removeNode(nodeToRemove.node);
  }

  return triangulatedGraph;
};

const buildMoralGraph = network => {
  const nodes = Object.keys(network).map(id => network[id]);
  const moralGraph = createGraph();

  for (const node of nodes) {
    moralGraph.addNode(node.id);

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

const createGraph = () => {
  const nodes = [];
  const edges = [];

  const addNode = node => {
    nodes.push(node);
  };

  const removeNode = node => {
    for (let i = edges.length - 1; i >= 0; i--) {
      if (edges[i][0] === node || edges[i][1] === node) {
        edges.splice(i, 1);
      }
    }

    for (let i = nodes.length - 1; i >= 0; i--) {
      if (nodes[i] === node) {
        nodes.splice(i, 1);
        break;
      }
    }
  };

  const getNodes = () => {
    return nodes;
  };

  const containsNode = node => {
    return nodes.some(x => x === node);
  };

  const addEdge = (nodeA, nodeB) => {
    edges.push([ nodeA, nodeB ]);
  };

  const removeEdge = (nodeA, nodeB) => {
    for (let i = edges.length - 1; i >= 0; i--) {
      const shouldRemove =
        (edges[i][0] === nodeA && edges[i][1] === nodeB) ||
        (edges[i][0] === nodeB && edges[i][1] === nodeA);

      if (shouldRemove) {
        edges.splice(i, 1);
      }
    }
  };

  const areConnected = (nodeA, nodeB) => {
    return edges.some(edge => {
      return (edge[0] === nodeA && edge[1] === nodeB) ||
             (edge[0] === nodeB && edge[1] === nodeA);
    });
  };

  const getNeighborsOf = node => {
    const neighbors = [];

    for (const edge of edges) {
      if (edge[0] === node) {
        neighbors.push(edge[1]);
      } else if (edge[1] === node) {
        neighbors.push(edge[0]);
      }
    }

    return neighbors;
  };

  const clone = () => {
    const clonedGraph = createGraph();

    for (const node of nodes) {
      clonedGraph.addNode(node);
    }

    for (const edge of edges) {
      clonedGraph.addEdge(edge[0], edge[1]);
    }

    return clonedGraph;
  };

  return {
    addNode,
    removeNode,
    getNodes,
    containsNode,
    addEdge,
    removeEdge,
    areConnected,
    getNeighborsOf,
    clone,
    print: () => {
      console.log('nodes');
      console.dir(nodes);
      console.log('edges');
      console.dir(edges);
    }
  };
};
