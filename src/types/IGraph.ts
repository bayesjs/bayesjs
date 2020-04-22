import { IEdge } from './IEdge'
import { INode } from './INode'

export interface IGraph {
  getNodes(): INode[];
  setEdges(edges: IEdge[]): void;
  setNodeIds(nodeIds: string[]): void;
  addNodeId(nodeId: string): void;
  removeNodeId(nodeId: string): void;
  getNodesId(): string[];
  getEdges(): IEdge[];
  hasNodeId(nodeId: string): boolean;
  addEdge(nodeA: string, nodeB: string): void;
  removeEdge(nodeA: string, nodeB: string): void;
  hasEdge(nodeA: string, nodeB: string): boolean;
  hasNotEdge(nodeA: string, nodeB: string): boolean;
  getNodeEdges(nodeId: string): string[];
  clone(): IGraph;
}
