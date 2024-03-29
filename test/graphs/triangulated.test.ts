import { createTriangulatedGraph as buildTriangulatedGraph, createGraphBuilder, createMoralGraph } from '../../src/graphs'
import { createNetwork } from '../../src/utils'
import { allNodes as hugeNetworkAllNodes } from '../../models/huge-network'

import { INode } from '../../src'

const hugeNetwork = createNetwork(...hugeNetworkAllNodes)
const hugeGraph = createGraphBuilder(hugeNetwork)
const moralizedHugeGraph = createMoralGraph(hugeGraph)

const nodeA: INode = {
  id: 'A',
  parents: [],
  states: [],
  cpt: {},
}

const nodeB: INode = {
  id: 'B',
  parents: ['A'],
  states: [],
  cpt: {},
}

const nodeC: INode = {
  id: 'C',
  parents: ['A'],
  states: [],
  cpt: {},
}

const nodeD: INode = {
  id: 'D',
  parents: ['B'],
  states: [],
  cpt: {},
}

const nodeE: INode = {
  id: 'E',
  parents: ['C'],
  states: [],
  cpt: {},
}

const nodeF: INode = {
  id: 'F',
  parents: ['D', 'E'],
  states: [],
  cpt: {},
}

const createTriangulatedGraph = () => {
  const network = { nodeA, nodeB, nodeC, nodeD, nodeE, nodeF }
  const graph = createGraphBuilder(network)

  graph.addEdge('E', 'D') // moral graph

  return buildTriangulatedGraph(graph)
}

describe('Triangulated Graph', () => {
  it('has 9 node connections (edges)', () => {
    const triangulatedGraph = createTriangulatedGraph()

    expect(triangulatedGraph.getEdges().length).toBe(9)
  })

  it('connects node A and B', () => {
    const triangulatedGraph = createTriangulatedGraph()

    expect(triangulatedGraph.hasEdge('A', 'B')).toBeTruthy()
  })

  it('connects node A and C', () => {
    const triangulatedGraph = createTriangulatedGraph()

    expect(triangulatedGraph.hasEdge('A', 'C')).toBeTruthy()
  })

  it('connects node B and D', () => {
    const triangulatedGraph = createTriangulatedGraph()

    expect(triangulatedGraph.hasEdge('B', 'D')).toBeTruthy()
  })

  it('connects node E and C', () => {
    const triangulatedGraph = createTriangulatedGraph()

    expect(triangulatedGraph.hasEdge('E', 'C')).toBeTruthy()
  })

  it('connects node D and F', () => {
    const triangulatedGraph = createTriangulatedGraph()

    expect(triangulatedGraph.hasEdge('D', 'F')).toBeTruthy()
  })

  it('connects node E and F', () => {
    const triangulatedGraph = createTriangulatedGraph()

    expect(triangulatedGraph.hasEdge('E', 'F')).toBeTruthy()
  })

  it('connects node E and D', () => {
    const triangulatedGraph = createTriangulatedGraph()

    expect(triangulatedGraph.hasEdge('E', 'D')).toBeTruthy()
  })

  it('connects node B and C', () => {
    const triangulatedGraph = createTriangulatedGraph()

    expect(triangulatedGraph.hasEdge('B', 'C')).toBeTruthy()
  })

  it('connects node D and C', () => {
    const triangulatedGraph = createTriangulatedGraph()

    expect(triangulatedGraph.hasEdge('D', 'C')).toBeTruthy()
  })
})

describe('Triangulated moral graph of huge network graph', () => {
  it('has 83 more connections (edges) than the original graph', () => {
    const triangulatedGraph = buildTriangulatedGraph(moralizedHugeGraph)
    const moralizedGraphEdges = moralizedHugeGraph.getEdges().map(x => x.sort())
    const triangulatedGraphEdges = triangulatedGraph.getEdges().map(x => x.sort())

    expect(triangulatedGraphEdges).toEqual(moralizedGraphEdges)
  })
})
