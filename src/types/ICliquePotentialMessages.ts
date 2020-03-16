import { ICliquePotentialItem } from './ICliquePotentialItem'

export interface ICliquePotentialMessages {
  [id: string]: Map<string, ICliquePotentialItem[]>;
}
