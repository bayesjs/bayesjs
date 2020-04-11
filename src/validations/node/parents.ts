import { INetwork, INode } from '../../types'
import { forEach, has, isNil, toString } from 'ramda'

import { isNotString } from '../../utils'

const checkIfParentsExist = ({ id, parents }: INode, network: INetwork) => {
  forEach(parentId => {
    if (isNotString(parentId)) {
      throw new Error(`[Node "${id}"]: All node parents must be strings.\n\nCurrent parents: ${toString(parents)}\nWrong parent: ${toString(parentId)}`)
    }

    if (!has(parentId, network)) {
      throw new Error(`[Node "${id}"]: The node parent "${parentId}" was not found in the network.`)
    }
  }, parents)
}

export default (node: INode, network: INetwork) => {
  if (isNil(node.parents)) {
    throw new Error(`[Node "${node.id}"]: The node parents is required and must be an array of strings.\n\nNode: ${toString(node)}`)
  }

  if (!Array.isArray(node.parents)) {
    throw new Error(`[Node "${node.id}"]: The node parents must be an array of strings.\n\nCurrent parents: ${toString(node.parents)}`)
  }

  checkIfParentsExist(node, network)
}
