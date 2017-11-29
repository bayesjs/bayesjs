export interface IGraph {
  addNodeId(nodeId: string),
  removeNodeId(nodeId: string),
  getNodesId(): string[],
  containsNodeId(nodeId: string): boolean,
  addEdge(nodeA: string, nodeB: string),
  removeEdge(nodeA: string, nodeB: string),
  areConnected(nodeA: string, nodeB: string): boolean,
  getNeighborsOf(nodeId: string): string[],
  clone(): IGraph,
  print()
}