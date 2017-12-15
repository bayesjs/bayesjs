import {
  ICptWithParents,
  ICptWithParentsItem,
  ICptWithoutParents,
} from './index'

export interface INode {
  id: string,
  states: string[],
  parents: string[],
  cpt: ICptWithoutParents | ICptWithParents
}