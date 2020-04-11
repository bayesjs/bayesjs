import validNodeId from '../../../src/validations/node/id'

describe('Node Id Validations', () => {
  describe('When node does not have "id"', () => {
    const node = { states: ['T', 'F'] }

    it('throws an error that node id is required', () => {
      expect(() => {
        // @ts-ignore
        validNodeId(node)
      }).toThrow(`The node id is required and must be a string.

Node: {"states": ["T", "F"]}`)
    })
  })

  describe('When node has "id" but is not a string', () => {
    const node = { id: 123 }

    it('throws an error that node id must be a string', () => {
      expect(() => {
        // @ts-ignore
        validNodeId(node)
      }).toThrow(`The node id must be a string.

Node id: 123
Node: {"id": 123}`)
    })
  })

  describe('When node has "id" but is not a string', () => {
    const node = { id: 'node-id' }

    it('does not throws an error', () => {
      expect(() => {
        // @ts-ignore
        validNodeId(node)
      }).not.toThrow()
    })
  })
})
