import { 
  ICptWithParentsItem, 
  ICliquePotentialItem 
} from "./index";

export interface IClique {
  id: string,
  clique: string[],
  potentials?: ICliquePotentialItem[],
  messagesReceived?: Map<string, ICliquePotentialItem[]>,
  factors?: string[]
}