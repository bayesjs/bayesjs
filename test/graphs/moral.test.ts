import { createGraphBuilder, createMoralGraph } from '../../src/graphs'

import { INode } from '../../src'

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

const network = { nodeA, nodeB, nodeC, nodeD, nodeE, nodeF }
const graph = createGraphBuilder(network)

describe('Moral Graph', () => {
  it('has 7 node connections (edges)', () => {
    const moralGraph = createMoralGraph(graph)

    expect(moralGraph.getEdges().length).toBe(7)
  })

  it('connects node A and B', () => {
    const moralGraph = createMoralGraph(graph)

    expect(moralGraph.hasEdge('A', 'B')).toBeTruthy()
  })

  it('connects node A and C', () => {
    const moralGraph = createMoralGraph(graph)

    expect(moralGraph.hasEdge('A', 'C')).toBeTruthy()
  })

  it('connects node B and D', () => {
    const moralGraph = createMoralGraph(graph)

    expect(moralGraph.hasEdge('B', 'D')).toBeTruthy()
  })

  it('connects node E and C', () => {
    const moralGraph = createMoralGraph(graph)

    expect(moralGraph.hasEdge('E', 'C')).toBeTruthy()
  })

  it('connects node D and F', () => {
    const moralGraph = createMoralGraph(graph)

    expect(moralGraph.hasEdge('D', 'F')).toBeTruthy()
  })

  it('connects node E and F', () => {
    const moralGraph = createMoralGraph(graph)

    expect(moralGraph.hasEdge('E', 'F')).toBeTruthy()
  })

  it('connects node E and D', () => {
    const moralGraph = createMoralGraph(graph)

    expect(moralGraph.hasEdge('E', 'D')).toBeTruthy()
  })
})
