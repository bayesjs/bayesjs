import { INetwork, INodeList } from "../types/index";

export const toNodeList = (network: INetwork): INodeList => {
  const nodeIds = Object.keys(network)

  return nodeIds.reduce( ( list, nodeIs ) => ([ ...list, network[nodeIs] ]), [] )
}