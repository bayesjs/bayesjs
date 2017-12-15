import { 
  ICptWithParentsItem, 
  ICliquePotentialItem 
} from "./index";

export interface IClique {
  id: string,
  nodeIds: string[],
  potentials?: ICliquePotentialItem[],
  messagesReceived?: Map<string, ICliquePotentialItem[]>,
  factors?: string[]
}