export interface ICptWithoutParents {
  [key: string]: number
}

export interface ICptWithParentsItem {
  when: { [key: string]: string },
  then: { [key: string]: number }
}

export interface ICptWithParents extends Array<ICptWithParentsItem> {
}

export interface INode {
  id: string,
  states: string[],
  parents: string[],
  cpt: ICptWithoutParents | ICptWithParents
}