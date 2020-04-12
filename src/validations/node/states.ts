import { isEmpty, isNil, toString, type } from 'ramda'

import { INode } from '../../types'
import { isNotString } from '../../utils'

export default (node: INode) => {
  if (isNil(node.states)) {
    throw new Error(`[Node "${node.id}"]: The node states is required and must be an array of strings.

Node: ${toString(node)}`)
  }

  if (!Array.isArray(node.states)) {
    throw new Error(`[Node "${node.id}"]: The node states must be an array of strings.

Node states type: ${type(node.states)}
Node states: ${toString(node.states)}`)
  }

  if (isEmpty(node.states)) {
    throw new Error(`[Node "${node.id}"]: The node states must contain at least one string.

Node states: ${toString(node.states)}`)
  }

  node.states.forEach(state => {
    if (isNotString(state)) {
      throw new Error(`[Node "${node.id}"]: All node states must be strings.

Node state type: ${type(state)}
Node state: ${toString(state)}
Node states: ${toString(node.states)}`)
    }
  })
}
