import { 
  INetwork, 
  INodeList, 
  INode 
} from '../types/index';
import { addNode } from '../index';

export const networkToNodeList = (network: INetwork): INodeList => {
  const nodeIds = Object.keys(network)

  return nodeIds.reduce( ( list, nodeIs ) => ([ ...list, network[nodeIs] ]), [] )
}

export const createNetwork = (...nodes: INode[]): INetwork => {
  return nodes.reduce((net, node) => ({ ...addNode(net, node) }), {});
}