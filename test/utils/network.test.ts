import * as expect from 'expect'

import { alarm, burglary, earthquake, johnCalls, maryCalls } from '../../models/alarm'
import { createNetwork, networkToNodeList } from '../../src/utils'
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

describe('utils', () => {
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
})
