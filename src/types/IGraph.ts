export interface IGraph {
  addNode(nodeId: string),
  removeNode(nodeId: string),
  getNodes(): string[],
  containsNode(nodeId: string): boolean,
  addEdge(nodeA: string, nodeB: string),
  removeEdge(nodeA: string, nodeB: string),
  areConnected(nodeA: string, nodeB: string): boolean,
  getNeighborsOf(nodeId: string): string[],
  clone(): IGraph,
  print()
}