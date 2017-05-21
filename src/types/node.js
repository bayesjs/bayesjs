// @flow

export type CptWithoutParents = {
  [key: string]: number
};

export type CptWithParentsItem = {
  when: { [key: string]: string },
  then: { [key: string]: number }
};

export type CptWithParents = CptWithParentsItem[];

export type Node = {
  id: string,
  states: string[],
  parents: string[],
  cpt: CptWithoutParents | CptWithParents
};