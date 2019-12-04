import {
  ICliquePotentialItem,
} from '.'

export interface IClique {
  id: string;
  nodeIds: string[];
  potentials?: ICliquePotentialItem[];
  messagesReceived?: Map<string, ICliquePotentialItem[]>;
  factors?: string[];
}
