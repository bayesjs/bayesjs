import { isNil, toString } from 'ramda'

import { INode } from '../../types'
import { isNotString } from '../../utils'

export default (node: INode) => {
  if (isNil(node.id)) {
    throw new Error(`The node id is required and must be a string.

Node: ${toString(node)}`)
  }

  if (isNotString(node.id)) {
    throw new Error(`The node id must be a string.

Node id: ${toString(node.id)}
Node: ${toString(node)}`)
  }
}
