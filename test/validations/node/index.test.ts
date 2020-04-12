import * as expect from 'expect'
import * as nodeCptValidation from '../../../src/validations/node/cpt'
import * as nodeIdValidation from '../../../src/validations/node/id'
import * as nodeParentsValidation from '../../../src/validations/node/parents'
import * as nodeStatesValidation from '../../../src/validations/node/states'

import nodeValidations from '../../../src/validations/node'

describe('Node Validations', () => {
  const node = {
    id: 'node-id',
    states: ['T', 'F'],
    parents: [],
    cpt: { T: 0.2, F: 0.8 },
  }
  const network = {}

  describe('when node is not in network', () => {
    let nodeCpt: jest.SpyInstance
    let nodeId: jest.SpyInstance
    let nodeParents: jest.SpyInstance
    let nodeStates: jest.SpyInstance

    beforeEach(() => {
      nodeCpt = jest.spyOn(nodeCptValidation, 'default')
      nodeId = jest.spyOn(nodeIdValidation, 'default')
      nodeParents = jest.spyOn(nodeParentsValidation, 'default')
      nodeStates = jest.spyOn(nodeStatesValidation, 'default')

      nodeValidations(node, network)
    })

    it('calls nodeCpt validation', () => {
      expect(nodeCpt).toHaveBeenCalledWith(node, network)
    })

    it('calls nodeId validation', () => {
      expect(nodeId).toHaveBeenCalledWith(node)
    })

    it('calls nodeParents validation', () => {
      expect(nodeParents).toHaveBeenCalledWith(node, network)
    })

    it('calls nodeStates validation', () => {
      expect(nodeStates).toHaveBeenCalledWith(node)
    })
  })
})
