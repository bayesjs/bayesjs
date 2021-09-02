import { INode } from '../../src'
import { createCliques as buildCliques } from '../../src/utils/create-cliques'
import { createNetwork } from '../../src/utils'
import { createGraphBuilder } from '../../src/graphs'
import createJTreeCliques from '../../src/inferences/junctionTree/create-cliques'
import { allNodes as hugeNetworkAllNodes } from '../../models/huge-network'
const hugeNetwork = createNetwork(...hugeNetworkAllNodes)

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

const { cliques: hugeNetCliques } = createJTreeCliques(hugeNetwork)
const expectedCliques = [
  ['node1', 'node13', 'node16', 'node17', 'node24', 'node25', 'node37'],
  ['node1', 'node24', 'node31'],
  ['node1', 'node24', 'node32'],
  ['node1', 'node24', 'node33'],
  ['node1', 'node24', 'node34'],
  ['node1', 'node24', 'node35'],
  ['node2', 'node3', 'node4', 'node5', 'node6', 'node7', 'node8', 'node9'],
  ['node2', 'node10', 'node38'],
  ['node10', 'node11', 'node12'],
  ['node13', 'node14', 'node15'],
  ['node13', 'node16', 'node17', 'node25', 'node36', 'node37'],
  ['node17', 'node18', 'node23'],
  ['node18', 'node19', 'node20', 'node21', 'node22'],
  ['node25', 'node26', 'node27', 'node28', 'node29', 'node30'],
  ['node37', 'node38', 'node39'],
].map(x => x.sort()).sort()

describe('Huge Network', () => {
  it('has 15 cliques', () => {
    const foundCliques = hugeNetCliques.map(x => x.nodeIds.sort()).sort()
    expect(foundCliques[0]).toEqual(expectedCliques[0])
    expect(foundCliques[1]).toEqual(expectedCliques[1])
    expect(foundCliques[2]).toEqual(expectedCliques[2])
    expect(foundCliques[3]).toEqual(expectedCliques[3])
    expect(foundCliques[4]).toEqual(expectedCliques[4])
    expect(foundCliques[5]).toEqual(expectedCliques[5])
    expect(foundCliques[6]).toEqual(expectedCliques[6])
    expect(foundCliques[7]).toEqual(expectedCliques[7])
    expect(foundCliques[8]).toEqual(expectedCliques[8])
    expect(foundCliques[9]).toEqual(expectedCliques[9])
    expect(foundCliques[10]).toEqual(expectedCliques[10])
    expect(foundCliques[11]).toEqual(expectedCliques[11])
    expect(foundCliques[12]).toEqual(expectedCliques[12])
    expect(foundCliques[13]).toEqual(expectedCliques[13])
    expect(foundCliques[14]).toEqual(expectedCliques[14])
    expect(foundCliques[15]).toEqual(expectedCliques[15])
    expect(hugeNetCliques.length).toBe(15)
  })
})
