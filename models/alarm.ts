import { INode, ICptWithParents, ICptWithoutParents } from '../src/types'

export const burglary: INode = {
  id: 'BURGLARY',
  states: ['T', 'F'],
  parents: [],
  cpt: { T: 0.001, F: 0.999 },
}

export const earthquake: INode = {
  id: 'EARTHQUAKE',
  states: ['T', 'F'],
  parents: [],
  cpt: { T: 0.002, F: 0.998 },
}

export const alarm = {
  id: 'ALARM',
  states: ['T', 'F'],
  parents: ['BURGLARY', 'EARTHQUAKE'],
  cpt: [
    { when: { BURGLARY: 'T', EARTHQUAKE: 'T' }, then: { T: 0.95, F: 0.05 } },
    { when: { BURGLARY: 'T', EARTHQUAKE: 'F' }, then: { T: 0.94, F: 0.06 } },
    { when: { BURGLARY: 'F', EARTHQUAKE: 'T' }, then: { T: 0.29, F: 0.71 } },
    { when: { BURGLARY: 'F', EARTHQUAKE: 'F' }, then: { T: 0.001, F: 0.999 } },
  ],
}

export const johnCalls: INode = {
  id: 'JOHN_CALLS',
  states: ['T', 'F'],
  parents: ['ALARM'],
  cpt: [
    { when: { ALARM: 'T' }, then: { T: 0.9, F: 0.1 } },
    { when: { ALARM: 'F' }, then: { T: 0.05, F: 0.95 } },
  ],
}

export const maryCalls: INode = {
  id: 'MARY_CALLS',
  states: ['T', 'F'],
  parents: ['ALARM'],
  cpt: [
    { when: { ALARM: 'T' }, then: { T: 0.7, F: 0.3 } },
    { when: { ALARM: 'F' }, then: { T: 0.01, F: 0.99 } },
  ],
}

export const allNodes = [burglary, earthquake, alarm, johnCalls, maryCalls]
export const network: { [name: string]: { levels: string[]; parents: string[]; cpt?: ICptWithParents | ICptWithoutParents}} = {}
allNodes.forEach((node: INode) => {
  network[node.id] = {
    levels: node.states,
    parents: node.parents,
    cpt: node.cpt,
  }
})
