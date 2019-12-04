import { ICombinations, INetwork } from '.'

export interface IInfer {
  (network: INetwork, nodes: ICombinations, given?: ICombinations): number;
}
