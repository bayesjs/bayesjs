import { INode } from '../src/types'

export const rain: INode = {
  id: 'RAIN',
  states: [ 'T', 'F' ],
  parents: [],
  cpt: { 'T': 0.2, 'F': 0.8 }
};

export const sprinkler: INode = {
  id: 'SPRINKLER',
  states: [ 'T', 'F' ],
  parents: [ 'RAIN' ],
  cpt: [
    { when: { 'RAIN': 'T' }, then: { 'T': 0.01, 'F': 0.99 } },
    { when: { 'RAIN': 'F' }, then: { 'T': 0.4, 'F': 0.6 } }
  ]
};

export const grassWet: INode = {
  id: 'GRASS_WET',
  states: [ 'T', 'F' ],
  parents: [ 'RAIN', 'SPRINKLER' ],
  cpt: [
    { when: { 'RAIN': 'T', 'SPRINKLER': 'T' }, then: { 'T': 0.99, 'F': 0.01 } },
    { when: { 'RAIN': 'T', 'SPRINKLER': 'F' }, then: { 'T': 0.8, 'F': 0.2 } },
    { when: { 'RAIN': 'F', 'SPRINKLER': 'T' }, then: { 'T': 0.9, 'F': 0.1 } },
    { when: { 'RAIN': 'F', 'SPRINKLER': 'F' }, then: { 'T': 0, 'F': 1 } }
  ]
};

export const allNodes = [rain, sprinkler, grassWet];