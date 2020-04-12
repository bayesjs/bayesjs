import * as expect from 'expect'
import * as nodeValidations from '../src/validations/node'

import { INetwork } from '../src/types'
import { addNode } from '../src'

describe('Builder', () => {
  describe('addNode', () => {
    const node = {
      id: 'node-id',
      states: ['T', 'F'],
      parents: [],
      cpt: { T: 0.2, F: 0.8 },
    }
    const network = {}

    describe('when node is already in network', () => {
      it('throws an error that node is already in network', () => {
        const newNetwork = addNode(network, node)

        expect(() => {
          // @ts-ignore
          addNode(newNetwork, node)
        }).toThrow('[Node "node-id"]: This node is already added to the network.')
      })
    })

    describe('when node is not in network', () => {
      let validNode: jest.SpyInstance
      let newNetwork: INetwork

      beforeEach(() => {
        validNode = jest.spyOn(nodeValidations, 'default')
        newNetwork = addNode(network, node)
      })

      it('calls node validations', () => {
        expect(validNode).toHaveBeenCalledWith(node, network)
      })

      it('returns network with node', () => {
        expect(newNetwork).toEqual({
          'node-id': {
            id: 'node-id',
            states: ['T', 'F'],
            parents: [],
            cpt: { T: 0.2, F: 0.8 },
          },
        })
      })
    })
  })
})
