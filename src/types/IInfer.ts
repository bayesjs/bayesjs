import { ICombinations, INetwork } from "./index";

export interface IInfer {
  (network: INetwork, nodes?: ICombinations, given?: ICombinations): number
}