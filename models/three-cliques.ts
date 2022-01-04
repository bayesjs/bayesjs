import { INode, ICptWithParents, ICptWithoutParents } from '../src/types'

export const NodeA: INode = {
  id: 'A',
  states: ['T', 'F'],
  parents: [],
  cpt: { T: 0.5, F: 0.5 },
}

export const NodeB: INode = {
  id: 'B',
  states: ['T', 'F'],
  parents: ['A'],
  cpt: [
    { when: { A: 'T' }, then: { T: 0.5, F: 0.5 } },
    { when: { A: 'F' }, then: { T: 0.5, F: 0.5 } },
  ],
}

export const NodeC: INode = {
  id: 'C',
  states: ['T', 'F'],
  parents: ['B'],
  cpt: [
    { when: { B: 'T' }, then: { T: 0.1, F: 0.9 } },
    { when: { B: 'F' }, then: { T: 0.2, F: 0.8 } },
  ],
}

export const NodeD: INode = {
  id: 'D',
  states: ['T', 'F'],
  parents: ['B', 'C'],
  cpt: [
    { when: { B: 'T', C: 'T' }, then: { T: 0.5, F: 0.5 } },
    { when: { B: 'T', C: 'F' }, then: { T: 0.5, F: 0.5 } },
    { when: { B: 'F', C: 'T' }, then: { T: 0.5, F: 0.5 } },
    { when: { B: 'F', C: 'F' }, then: { T: 0.5, F: 0.5 } },
  ],
}

export const NodeE: INode = {
  id: 'E',
  states: ['T', 'F'],
  parents: ['B', 'C'],
  cpt: [
    { when: { B: 'T', C: 'T' }, then: { T: 0.5, F: 0.5 } },
    { when: { B: 'T', C: 'F' }, then: { T: 0.5, F: 0.5 } },
    { when: { B: 'F', C: 'T' }, then: { T: 0.5, F: 0.5 } },
    { when: { B: 'F', C: 'F' }, then: { T: 0.5, F: 0.5 } },
  ],
}

export const allNodes = [NodeA, NodeB, NodeC, NodeD, NodeE]
export const network: { [name: string]: { levels: string[]; parents: string[]; cpt?: ICptWithParents | ICptWithoutParents}} = {}
allNodes.forEach((node: INode) => {
  network[node.id] = {
    levels: node.states,
    parents: node.parents,
    cpt: node.cpt,
  }
})
