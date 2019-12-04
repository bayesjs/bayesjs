import { IEdge } from '.'

export interface IGraph {
  addNodeId(nodeId: string): void;
  removeNodeId(nodeId: string): void;
  getNodesId(): string[];
  getEdges(): IEdge[];
  containsNodeId(nodeId: string): boolean;
  addEdge(nodeA: string, nodeB: string): void;
  removeEdge(nodeA: string, nodeB: string): void;
  areConnected(nodeA: string, nodeB: string): boolean;
  getNeighborsOf(nodeId: string): string[];
  clone(): IGraph;
  print(): void;
}
