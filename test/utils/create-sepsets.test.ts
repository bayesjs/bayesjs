import { IClique } from '../../src'
import { createSepSets } from '../../src/utils'

// This colleciton of cliques comes from a moralized, triangularized netowrk with the
// following topology:

// A --- C --- F
// |   / | \   |
// | /   |   \ |
// B --- D --- E

// It should have a junction tree equivalent up to factor ordering to the following:

//           { B,C }           { C,D }           { D,E }
// { A,B,C } ------- { B,C,D } ------- { C,D,E } ------ { D,E,F }
const cliques: IClique[] = [
  { id: '0', nodeIds: ['C', 'E', 'D'] },
  { id: '1', nodeIds: ['C', 'B', 'A'] },
  { id: '2', nodeIds: ['C', 'B', 'D'] },
  { id: '3', nodeIds: ['F', 'D', 'E'] },
]

describe('Create SepSets Utils', () => {
  it('creates 3 sepsets', () => {
    const sepSets = createSepSets(cliques, jest.fn())

    expect(sepSets.length).toBe(3)
  })

  it('calls "onRemove" function twice', () => {
    // the fully connected clique graph will have three nodes of cardinality 2,
    // and two nodes where the separationSet has cardinality of 1.   It also will
    // have two cycles:
    //          { C }
    //      (1) ----- (0)
    //       |      /  |
    // {C,B} |{C,D}/   | {D,E}
    //       |  /      |
    //      (2) ----- (3)
    //          { D }

    // In order to construct a maximal spanning tree with the running intersection
    // property, two separation sets must be removed, {C} and {D}
    const onRemove = jest.fn()
    createSepSets(cliques, onRemove)

    expect(onRemove).toHaveBeenCalledTimes(2)
    expect(onRemove).toHaveBeenNthCalledWith(1, '0', '1')
    expect(onRemove).toHaveBeenNthCalledWith(2, '2', '3')
  })

  describe('Where the first sepset', () => {
    const getSepSet = () => createSepSets(cliques, jest.fn())[0]

    it('connects clique "0" and "2"', () => {
      const sepSet = getSepSet()

      expect(sepSet.ca).toBe('0')
      expect(sepSet.cb).toBe('2')
    })

    it('has 2 shared nodes ("C","D")', () => {
      const sepSet = getSepSet()

      expect(sepSet.sharedNodes.sort()).toEqual(['C', 'D'])
    })
  })

  describe('Where the second sepset', () => {
    const getSepSet = () => createSepSets(cliques, jest.fn())[1]

    it('connects clique "0" and "3"', () => {
      const sepSet = getSepSet()

      expect(sepSet.ca).toBe('0')
      expect(sepSet.cb).toBe('3')
    })

    it('has 2 shared nodes ("D", "E")', () => {
      const sepSet = getSepSet()

      expect(sepSet.sharedNodes.sort()).toEqual(['D', 'E'])
    })
  })

  describe('Where the third sepset', () => {
    const getSepSet = () => createSepSets(cliques, jest.fn())[2]

    it('connects clique "1" and "2"', () => {
      const sepSet = getSepSet()

      expect(sepSet.ca).toBe('1')
      expect(sepSet.cb).toBe('2')
    })

    it('has 2 shared nodes ("C", "B")', () => {
      const sepSet = getSepSet()

      expect(sepSet.sharedNodes.sort()).toEqual(['B', 'C'])
    })
  })
})
