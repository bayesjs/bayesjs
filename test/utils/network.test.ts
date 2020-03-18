import * as expect from 'expect'

import { INetwork, INode } from '../../src/types'
import { alarm, burglary, earthquake, johnCalls, maryCalls } from '../../models/alarm'
import {
  createNetwork,
  getNodeId,
  getNodeIdsWithoutParents,
  getNodeParents,
  getNodeParentsAndId,
  getNodesFromNetwork,
  hasNodeParents,
  hasNotNodeParents,
  networkToNodeList,
} from '../../src/utils'
import { grassWet, rain, sprinkler } from '../../models/rain-sprinkler-grasswet'

import { addNode } from '../../src'

const isEven = (n: number) => (n % 2) === 0
const swap = <T>(array: T[], x: number, y: number) => {
  const a = array[x]
  const b = array[y]

  array[x] = b
  array[y] = a
}

// https://en.wikipedia.org/wiki/Heap%27s_algorithm
const allCombinationsHeap = <T>(array: T[], output: (array: T[]) => void, length?: number) => {
  const n = length === undefined ? array.length : length
  const c: number[] = []

  for (let i = 0; i < n; i++) {
    c[i] = 0
  }

  output(array)

  let i = 0
  while (i < n) {
    if (c[i] < i) {
      swap(array, isEven(i) ? 0 : c[i], i)
      output(array)
      c[i] += 1
      i = 0
    } else {
      c[i] = 0
      i++
    }
  }
}

describe('Network Utils', () => {
  describe('network', () => {
    it('createNetwork should works', () => {
      const net = createNetwork(rain, sprinkler, grassWet)
      let network = {}

      network = addNode(network, rain)
      network = addNode(network, sprinkler)
      network = addNode(network, grassWet)

      expect(net).toEqual(network)
    })

    it('networkToNodeList should works', () => {
      const net = createNetwork(rain, sprinkler, grassWet)
      const nodeList = [rain, sprinkler, grassWet]
      const result = networkToNodeList(net)

      expect(result).toEqual(nodeList)
    })

    it('networkToNodeList should create a network given nodes in any order', () => {
      const list = [burglary, earthquake, alarm, johnCalls, maryCalls]

      allCombinationsHeap(list, () =>
        expect(createNetwork(burglary, earthquake, alarm, johnCalls, maryCalls)).toBeTruthy(),
      )
    })
  })

  describe('getNodeId', () => {
    const node: INode = {
      id: 'node-id',
      parents: ['node-1', 'node-2'],
      states: ['True', 'False'],
      cpt: { True: 0.5, False: 0.5 },
    }

    it('returns node id', () => {
      expect(getNodeId(node)).toBe('node-id')
    })
  })

  describe('getNodeParents', () => {
    const node: INode = {
      id: 'node-id',
      parents: ['node-1', 'node-2'],
      states: ['True', 'False'],
      cpt: { True: 0.5, False: 0.5 },
    }

    it('returns node id', () => {
      expect(getNodeParents(node)).toEqual(['node-1', 'node-2'])
    })
  })

  describe('hasNodeParents', () => {
    describe('when node has no parents', () => {
      const node: INode = {
        id: 'node-id',
        parents: [],
        states: ['True', 'False'],
        cpt: { True: 0.5, False: 0.5 },
      }

      it('returns falsy', () => {
        expect(hasNodeParents(node)).toBeFalsy()
      })
    })

    describe('when node has parents', () => {
      const node: INode = {
        id: 'node-id',
        parents: ['node-1', 'node-2'],
        states: ['True', 'False'],
        cpt: { True: 0.5, False: 0.5 },
      }

      it('returns truthy', () => {
        expect(hasNodeParents(node)).toBeTruthy()
      })
    })
  })

  describe('getNodeParentsAndId', () => {
    const node: INode = {
      id: 'node-id',
      parents: ['node-1', 'node-2'],
      states: ['True', 'False'],
      cpt: { True: 0.5, False: 0.5 },
    }

    it('returns ', () => {
      expect(getNodeParentsAndId(node)).toEqual(['node-1', 'node-2', 'node-id'])
    })
  })

  describe('hasNotNodeParents', () => {
    describe('when node has no parents', () => {
      const node: INode = {
        id: 'node-id',
        parents: [],
        states: ['True', 'False'],
        cpt: { True: 0.5, False: 0.5 },
      }

      it('returns truthy', () => {
        expect(hasNotNodeParents(node)).toBeTruthy()
      })
    })

    describe('when node has parents', () => {
      const node: INode = {
        id: 'node-id',
        parents: ['node-1', 'node-2'],
        states: ['True', 'False'],
        cpt: { True: 0.5, False: 0.5 },
      }

      it('returns falsy', () => {
        expect(hasNotNodeParents(node)).toBeFalsy()
      })
    })
  })

  describe('getNodesFromNetwork', () => {
    const network: INetwork = {
      Node1: { id: 'Node1', states: ['T', 'F'], parents: [], cpt: {} },
      Node2: { id: 'Node2', states: ['T', 'F'], parents: [], cpt: {} },
      Node3: { id: 'Node3', states: ['T', 'F'], parents: [], cpt: {} },
    }

    it('returns an array of nodes', () => {
      expect(getNodesFromNetwork(network)).toEqual([
        { id: 'Node1', states: ['T', 'F'], parents: [], cpt: {} },
        { id: 'Node2', states: ['T', 'F'], parents: [], cpt: {} },
        { id: 'Node3', states: ['T', 'F'], parents: [], cpt: {} },
      ])
    })
  })

  describe('getNodeIdsWithoutParents', () => {
    const network: INetwork = {
      Node1: { id: 'Node1', states: ['T', 'F'], parents: [], cpt: {} },
      Node2: { id: 'Node2', states: ['T', 'F'], parents: ['node-123'], cpt: {} },
      Node3: { id: 'Node3', states: ['T', 'F'], parents: [], cpt: {} },
    }

    it('returns an array of nodes ids that does not have parents', () => {
      expect(getNodeIdsWithoutParents(network)).toEqual(['Node1', 'Node3'])
    })
  })
})
