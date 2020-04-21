import { IClique } from '../../src'
import { createSepSets } from '../../src/utils'

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
    const onRemove = jest.fn()
    createSepSets(cliques, onRemove)

    expect(onRemove).toHaveBeenCalledTimes(2)
    expect(onRemove).toHaveBeenNthCalledWith(1, '1', '2')
    expect(onRemove).toHaveBeenNthCalledWith(2, '2', '3')
  })

  describe('Where the first sepset', () => {
    const getSepSet = () => createSepSets(cliques, jest.fn())[0]

    it('connects clique "0" and "1"', () => {
      const sepSet = getSepSet()

      expect(sepSet.ca).toBe('0')
      expect(sepSet.cb).toBe('1')
    })

    it('has 1 shared nodes ("C")', () => {
      const sepSet = getSepSet()

      expect(sepSet.sharedNodes).toEqual(['C'])
    })
  })

  describe('Where the second sepset', () => {
    const getSepSet = () => createSepSets(cliques, jest.fn())[1]

    it('connects clique "0" and "2"', () => {
      const sepSet = getSepSet()

      expect(sepSet.ca).toBe('0')
      expect(sepSet.cb).toBe('2')
    })

    it('has 2 shared nodes ("C", "D")', () => {
      const sepSet = getSepSet()

      expect(sepSet.sharedNodes).toEqual(['C', 'D'])
    })
  })

  describe('Where the third sepset', () => {
    const getSepSet = () => createSepSets(cliques, jest.fn())[2]

    it('connects clique "0" and "2"', () => {
      const sepSet = getSepSet()

      expect(sepSet.ca).toBe('0')
      expect(sepSet.cb).toBe('3')
    })

    it('has 2 shared nodes ("E", "D")', () => {
      const sepSet = getSepSet()

      expect(sepSet.sharedNodes).toEqual(['E', 'D'])
    })
  })
})
