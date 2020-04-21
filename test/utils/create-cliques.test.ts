import { INode } from '../../src'
import { createCliques as buildCliques } from '../../src/utils/create-cliques'
import { createGraphBuilder } from '../../src/graphs'

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

const createCliques = () => {
  const network = { nodeA, nodeB, nodeC, nodeD, nodeE, nodeF }
  const graph = createGraphBuilder(network)

  graph.addEdge('E', 'D') // moral graph
  graph.addEdge('B', 'C') // triangulate graph
  graph.addEdge('D', 'C') // triangulate graph

  return buildCliques(graph)
}

describe('Create Cliques Utils', () => {
  it('creates 4 cliques', () => {
    const cliques = createCliques()

    expect(cliques.length).toBe(4)
  })

  describe('Where the first clique', () => {
    const getFirstCliques = () => createCliques()[0]

    it('has "0" as id', () => {
      const clique = getFirstCliques()

      expect(clique.id).toBe('0')
    })

    it('has 4 node ids ("C", "E", "D")', () => {
      const clique = getFirstCliques()

      expect(clique.nodeIds).toEqual(['C', 'E', 'D'])
    })
  })

  describe('Where the second clique', () => {
    const getFirstCliques = () => createCliques()[1]

    it('has "1" as id', () => {
      const clique = getFirstCliques()

      expect(clique.id).toBe('1')
    })

    it('has 4 node ids ("C", "B", "A")', () => {
      const clique = getFirstCliques()

      expect(clique.nodeIds).toEqual(['C', 'B', 'A'])
    })
  })

  describe('Where the third clique', () => {
    const getFirstCliques = () => createCliques()[2]

    it('has "2" as id', () => {
      const clique = getFirstCliques()

      expect(clique.id).toBe('2')
    })

    it('has 4 node ids ("C", "B", "D")', () => {
      const clique = getFirstCliques()

      expect(clique.nodeIds).toEqual(['C', 'B', 'D'])
    })
  })

  describe('Where the forth clique', () => {
    const getFirstCliques = () => createCliques()[3]

    it('has "3" as id', () => {
      const clique = getFirstCliques()

      expect(clique.id).toBe('3')
    })

    it('has 4 node ids ("F", "D", "E")', () => {
      const clique = getFirstCliques()

      expect(clique.nodeIds).toEqual(['F', 'D', 'E'])
    })
  })
})
