import { INetwork, INode } from '../../types'

import validNodeCpt from './cpt'
import validNodeId from './id'
import validNodeParents from './parents'
import validNodeStates from './states'

export default (node: INode, network: INetwork) => {
  validNodeId(node)
  validNodeStates(node)
  validNodeParents(node, network)
  validNodeCpt(node, network)
}
