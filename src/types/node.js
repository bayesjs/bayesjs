// @flow

export type ICptWithoutParents = {
  [key: string]: number
};

export type ICptWithParentsItem = {
  when: { [key: string]: string },
  then: { [key: string]: number }
};

export type ICptWithParents = ICptWithParentsItem[];

export type INode = {
  id: string,
  states: string[],
  parents: string[],
  cpt: ICptWithoutParents | ICptWithParents
};