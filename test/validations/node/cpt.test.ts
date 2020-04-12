import validNodeCpt from '../../../src/validations/node/cpt'

describe('Node Cpt Validations', () => {
  const network = {
    node1: {
      id: 'node1',
      states: ['True', 'False'],
    },
  }

  describe('When node does not have "cpt"', () => {
    const node = { id: 'node-id' }

    it('throws an error that node cpt is required', () => {
      expect(() => {
        // @ts-ignore
        validNodeCpt(node, network)
      }).toThrow(`[Node "node-id"]: The node cpt is required and must be an object or an array.

Node: {"id": "node-id"}`)
    })
  })

  describe('When node "cpt" is not an array nor object', () => {
    const node = { id: 'node-id', cpt: 'cpt' }

    it('throws an error that node cpt must be an array or object', () => {
      expect(() => {
        // @ts-ignore
        validNodeCpt(node, network)
      }).toThrow(`[Node "node-id"]: The node cpt must be an object or an array.

Node cpt type: String
Node cpt: "cpt"`)
    })
  })

  describe('When node "cpt" is an object', () => {
    describe('and has a missing probability', () => {
      const node = {
        id: 'node-id',
        states: ['True', 'False'],
        cpt: { True: 0.5 },
      }

      it('throws an error that has one missing probability', () => {
        expect(() => {
          // @ts-ignore
          validNodeCpt(node, network)
        }).toThrow(`[Node "node-id"]: Missing probability for "False" state.

Node cpt: {"True": 0.5}`)
      })
    })

    describe('and has probability that is not a number', () => {
      const node = {
        id: 'node-id',
        states: ['True', 'False'],
        cpt: { True: 0.5, False: '0.5' },
      }

      it('throws an error that has one probability is not a number', () => {
        expect(() => {
          // @ts-ignore
          validNodeCpt(node, network)
        }).toThrow(`[Node "node-id"]: All probabilities must be a number.

Node cpt type for "False": String
Node cpt for "False": "0.5"
Node cpt: {"False": "0.5", "True": 0.5}`)
      })
    })

    describe('and all probabilities are numbers', () => {
      const node = {
        id: 'node-id',
        states: ['True', 'False'],
        cpt: { True: 0.5, False: 0.5 },
      }

      it('does not throws an error', () => {
        expect(() => {
          // @ts-ignore
          validNodeCpt(node, network)
        }).not.toThrow()
      })
    })
  })

  describe('When node "cpt" is an array', () => {
    describe('and has not all parents combinations', () => {
      const node = {
        id: 'node-id',
        states: ['True', 'False'],
        parents: ['node1'],
        cpt: [
          { when: { node1: 'True' }, then: { True: 0.5, False: 0.5 } },
          // { when: { node1: 'False', }, then: { True: 0.5, False: 0.5 } },
        ],
      }

      it('throws an error that has one missing combination', () => {
        expect(() => {
          // @ts-ignore
          validNodeCpt(node, network)
        }).toThrow(`[Node "node-id"]: The node cpt has one missing combination.

Missing node cpt combination (when): {"node1": "False"}
Node cpt combinations (when's): [{"node1": "True"}]
Combinations needed: [{"node1": "True"}, {"node1": "False"}]`)
      })
    })

    describe('and has all parents combinations', () => {
      describe('and has one invalid combination', () => {
        let warn: jest.SpyInstance
        const node = {
          id: 'node-id',
          states: ['True', 'False'],
          parents: ['node1'],
          cpt: [
            { when: { 'invalid-node': 'True' }, then: { True: 0.5, False: 0.5 } },
            { when: { node1: 'True' }, then: { True: 0.5, False: 0.5 } },
            { when: { node1: 'False' }, then: { True: 0.5, False: 0.5 } },
          ],
        }

        beforeEach(() => {
          warn = jest.spyOn(console, 'warn')
        })

        afterEach(() => {
          warn.mockRestore()
        })

        it('warn that has invalid', () => {
          // @ts-ignore
          validNodeCpt(node, network)

          expect(warn).toHaveBeenCalledWith(`[Node "node-id"]: The node cpt has one extra/invalid combination.

Invalid node cpt combination (when): {"invalid-node": "True"}
Node cpt combinations (when's): [{"invalid-node": "True"}, {"node1": "True"}, {"node1": "False"}]
Combinations needed: [{"node1": "True"}, {"node1": "False"}]`)
        })
      })

      describe('and has a missing probability', () => {
        const node = {
          id: 'node-id',
          states: ['True', 'False'],
          parents: ['node1'],
          cpt: [
            { when: { node1: 'True' }, then: { False: 0.5 } },
            { when: { node1: 'False' }, then: { False: 0.5 } },
          ],
        }

        it('throws an error that has one missing probability', () => {
          expect(() => {
            // @ts-ignore
            validNodeCpt(node, network)
          }).toThrow(`[Node "node-id"]: Missing probability for "True" state.

Node cpt: {"False": 0.5}`)
        })
      })

      describe('and has probability that is not a number', () => {
        const node = {
          id: 'node-id',
          states: ['True', 'False'],
          parents: ['node1'],
          cpt: [
            { when: { node1: 'True' }, then: { True: '0.5', False: 0.5 } },
            { when: { node1: 'False' }, then: { True: '0.5', False: 0.5 } },
          ],
        }

        it('throws an error that has one probability is not a number', () => {
          expect(() => {
            // @ts-ignore
            validNodeCpt(node, network)
          }).toThrow(`[Node "node-id"]: All probabilities must be a number.

Node cpt type for "True": String
Node cpt for "True": "0.5"
Node cpt: {"False": 0.5, "True": "0.5"}`)
        })
      })

      describe('and all probabilities are numbers', () => {
        const node = {
          id: 'node-id',
          states: ['True', 'False'],
          parents: ['node1'],
          cpt: [
            { when: { node1: 'True' }, then: { True: 0.5, False: 0.5 } },
            { when: { node1: 'False' }, then: { True: 0.5, False: 0.5 } },
          ],
        }

        it('does not throws an error', () => {
          expect(() => {
            // @ts-ignore
            validNodeCpt(node, network)
          }).not.toThrow()
        })
      })
    })
  })
})
