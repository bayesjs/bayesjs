import { 
  INetwork, 
  INodeList, 
  INode 
} from '../types/index';

export const toNodeList = (network: INetwork): INodeList => {
  const nodeIds = Object.keys(network)

  return nodeIds.reduce( ( list, nodeIs ) => ([ ...list, network[nodeIs] ]), [] )
}

// export const addNodes = (network: INetwork, ...nodes: INode[]): INetwork => {
//   return nodes.reduce((net, node) => ({ ...addNe }), network);
  
//   network = addNode(network, rain);
//   network = addNode(network, sprinkler);
//   network = addNode(network, grassWet);
  
  
// }