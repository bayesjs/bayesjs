import { createCliqueGraph as buildCliqueGraph, createGraphBuilder } from '../../src/graphs'

import { INode } from '../../src/types'

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

const createCliqueGraph = () => {
  const network = { nodeA, nodeB, nodeC, nodeD, nodeE, nodeF }
  const graph = createGraphBuilder(network)

  graph.addEdge('E', 'D') // moral graph
  graph.addEdge('B', 'C') // triangulate graph
  graph.addEdge('D', 'C') // triangulate graph

  return buildCliqueGraph(graph)
}

describe('Clique Graph', () => {
  it('returns cliques', () => {
    const { cliques } = createCliqueGraph()

    expect(cliques).toBeTruthy()
  })

  describe('Where return a graph that', () => {
    it('has 5 clique connections (edges)', () => {
      const { graph } = createCliqueGraph()

      expect(graph.getEdges().length).toBe(5)
    })

    it('connects cliques 0 and 1', () => {
      const { graph } = createCliqueGraph()

      expect(graph.hasEdge('0', '1')).toBeTruthy()
    })

    it('connects cliques 0 and 2', () => {
      const { graph } = createCliqueGraph()

      expect(graph.hasEdge('0', '2')).toBeTruthy()
    })

    it('connects cliques 0 and 3', () => {
      const { graph } = createCliqueGraph()

      expect(graph.hasEdge('0', '3')).toBeTruthy()
    })

    it('connects cliques 1 and 2', () => {
      const { graph } = createCliqueGraph()

      expect(graph.hasEdge('1', '2')).toBeTruthy()
    })

    it('connects cliques 2 and 3', () => {
      const { graph } = createCliqueGraph()

      expect(graph.hasEdge('2', '3')).toBeTruthy()
    })
  })
})
