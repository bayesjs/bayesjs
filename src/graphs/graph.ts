import { 
  IEdge, 
  IGraph,
} from '../types/index';


const addNodeMaker = (nodes: string[]) => (nodeId: string) =>
  nodes.push(nodeId);

const removeNodesMaker = (nodes: string[], edges: IEdge[]) => (nodeId: string) => {
  for (let i = edges.length - 1; i >= 0; i--) {
    if (edges[i][0] === nodeId || edges[i][1] === nodeId) {
      edges.splice(i, 1);
    }
  }

  for (let i = nodes.length - 1; i >= 0; i--) {
    if (nodes[i] === nodeId) {
      nodes.splice(i, 1);
      break;
    }
  }
}

const containsNodeMaker = (nodes: string[]) => (nodeId: string) =>
  nodes.some(x => x === nodeId);

const addEdgeMaker = (edges: IEdge[]) => (nodeA: string, nodeB: string) => 
  edges.push([ nodeA, nodeB ]);

const removeEdgeMaker = (edges: IEdge[]) => (nodeA: string, nodeB: string) => {
  for (let i = edges.length - 1; i >= 0; i--) {
    const shouldRemove =
      (edges[i][0] === nodeA && edges[i][1] === nodeB) ||
      (edges[i][0] === nodeB && edges[i][1] === nodeA);

    if (shouldRemove) {
      edges.splice(i, 1);
    }
  }
}

const areConnectedMaker = (edges: IEdge[]) => (nodeA: string, nodeB: string) => {
  return edges.some(edge => {
    return (edge[0] === nodeA && edge[1] === nodeB) || 
      (edge[0] === nodeB && edge[1] === nodeA);
  });
};

const getNeighborsOfMaker = (edges: IEdge[]) => (nodeId: string) => {
  const neighbors = [];
  
  for (const edge of edges) {
    if (edge[0] === nodeId) {
      neighbors.push(edge[1]);
    } else if (edge[1] === nodeId) {
      neighbors.push(edge[0]);
    }
  }

  return neighbors;
}

const cloneMaker = (nodes: string[], edges: IEdge[]) => () => {
  const clonedGraph = createGraph();
  
  for (const node of nodes) {
    clonedGraph.addNodeId(node);
  }

  for (const edge of edges) {
    clonedGraph.addEdge(edge[0], edge[1]);
  }

  return clonedGraph;
}

const printMaker = (nodes: string[], edges: IEdge[]) => () => {
  console.log('nodes');
  console.dir(nodes);
  console.log('edges');
  console.dir(edges);
}

export const createGraph = (): IGraph => {
  const nodes: string[] = [];
  const edges: IEdge[] = [];

  const getNodesId = () => nodes;
  const addNodeId = addNodeMaker(nodes);
  const removeNodeId = removeNodesMaker(nodes, edges);
  const containsNodeId = containsNodeMaker(nodes);
  const addEdge = addEdgeMaker(edges);
  const removeEdge = removeEdgeMaker(edges);
  const areConnected = areConnectedMaker(edges);
  const getNeighborsOf = getNeighborsOfMaker(edges);
  const clone = cloneMaker(nodes, edges);
  const print = printMaker(nodes, edges);

  return {
    addNodeId,
    removeNodeId,
    getNodesId,
    containsNodeId,
    addEdge,
    removeEdge,
    areConnected,
    getNeighborsOf,
    clone,
    print
  };
};

