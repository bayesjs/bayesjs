import {
  ICptWithParents,
  ICptWithoutParents,
} from '.'

export interface INode {
  id: string;
  states: string[];
  parents: string[];
  cpt: ICptWithoutParents | ICptWithParents;
}
