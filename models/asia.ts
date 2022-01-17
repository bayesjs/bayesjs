import { INode, ICptWithParents, ICptWithoutParents } from '../src/types'

export const VisitToAsia: INode = {
  id: 'VisitToAsia',
  states: ['T', 'F'],
  parents: [],
  cpt: { F: 0.99, T: 0.01 },
}

export const Tuberculosis: INode = {
  id: 'Tuberculosis',
  states: ['T', 'F'],
  parents: ['VisitToAsia'],
  cpt: [
    { when: { VisitToAsia: 'F' }, then: { F: 0.99, T: 0.01 } },
    { when: { VisitToAsia: 'T' }, then: { F: 0.95, T: 0.05 } },
  ],
}

export const Smoker: INode = {
  id: 'Smoker',
  states: ['T', 'F'],
  parents: [],
  cpt: { F: 0.5, T: 0.5 },
}

export const LungCancer: INode = {
  id: 'LungCancer',
  states: ['T', 'F'],
  parents: ['Smoker'],
  cpt: [
    { when: { Smoker: 'F' }, then: { F: 0.99, T: 0.01 } },
    { when: { Smoker: 'T' }, then: { F: 0.9, T: 0.1 } },
  ],
}

export const TbOrCa = {
  id: 'TbOrCa',
  states: ['T', 'F'],
  parents: ['Tuberculosis', 'LungCancer'],
  cpt: [
    {
      when: { Tuberculosis: 'F', LungCancer: 'F' },
      then: { F: 1, T: 0 },
    },
    {
      when: { Tuberculosis: 'F', LungCancer: 'T' },
      then: { F: 0, T: 1 },
    },
    {
      when: { Tuberculosis: 'T', LungCancer: 'F' },
      then: { F: 0, T: 1 },
    },
    {
      when: { Tuberculosis: 'T', LungCancer: 'T' },
      then: { F: 0, T: 1 },
    },
  ],
}

export const AbnormalXRay: INode = {
  id: 'AbnormalXRay',
  states: ['T', 'F'],
  parents: ['TbOrCa'],
  cpt: [
    { when: { TbOrCa: 'F' }, then: { F: 0.95, T: 0.05 } },
    {
      when: { TbOrCa: 'T' },
      then: { F: 0.02, T: 0.98 },
    },
  ],
}

export const Bronchitis: INode = {
  id: 'Bronchitis',
  states: ['T', 'F'],
  parents: ['Smoker'],
  cpt: [
    { when: { Smoker: 'F' }, then: { F: 0.7, T: 0.3 } },
    { when: { Smoker: 'T' }, then: { F: 0.4, T: 0.6 } },
  ],
}

export const Dyspnea = {
  id: 'Dyspnea',
  states: ['T', 'F'],
  parents: ['TbOrCa', 'Bronchitis'],
  cpt: [
    {
      when: { TbOrCa: 'F', Bronchitis: 'F' },
      then: { F: 0.9, T: 0.1 },
    },
    {
      when: { TbOrCa: 'F', Bronchitis: 'T' },
      then: { F: 0.2, T: 0.8 },
    },
    {
      when: { TbOrCa: 'T', Bronchitis: 'F' },
      then: { F: 0.3, T: 0.7 },
    },
    {
      when: { TbOrCa: 'T', Bronchitis: 'T' },
      then: { F: 0.1, T: 0.9 },
    },
  ],
}

export const allNodes = [
  VisitToAsia,
  Tuberculosis,
  Smoker,
  LungCancer,
  TbOrCa,
  AbnormalXRay,
  Bronchitis,
  Dyspnea,
]
export const network: {
  [name: string]: {
    levels: string[];
    parents: string[];
    cpt?: ICptWithParents | ICptWithoutParents;
  };
} = {}
allNodes.forEach((node: INode) => {
  network[node.id] = {
    levels: node.states,
    parents: node.parents,
    cpt: node.cpt,
  }
})
