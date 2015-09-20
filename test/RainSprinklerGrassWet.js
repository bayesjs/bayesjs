const cptRain = [
  {
    conditions: [],
    probabilities: [ 0.2, 0.8 ]
  }
];

const cptSprinkler = [
  {
    conditions: [ { parent: 'RAIN', state: 'F'} ],
    probabilities: [ 0.4, 0.6 ]
  },
  {
    conditions: [ { parent: 'RAIN', state: 'T'} ],
    probabilities: [ 0.01, 0.99 ]
  }
];

const cptGrassWet = [
  {
    conditions: [
      { parent: 'SPRINKLER', state: 'F'},
      { parent: 'RAIN', state: 'F'}
    ],
    probabilities: [ 0.0, 1.0 ]
  },
  {
    conditions: [
      { parent: 'SPRINKLER', state: 'F'},
      { parent: 'RAIN', state: 'T'}
    ],
    probabilities: [ 0.8, 0.2 ]
  },
  {
    conditions: [
      { parent: 'SPRINKLER', state: 'T'},
      { parent: 'RAIN', state: 'F'}
    ],
    probabilities: [ 0.9, 0.1 ]
  },
  {
    conditions: [
      { parent: 'SPRINKLER', state: 'T'},
      { parent: 'RAIN', state: 'T'}
    ],
    probabilities: [ 0.99, 0.01 ]
  }
];

export const nodes = [
  { id: 'RAIN',      states: [ 'T', 'F' ], cpt: cptRain },
  { id: 'SPRINKLER', states: [ 'T', 'F' ], cpt: cptSprinkler },
  { id: 'GRASS_WET', states: [ 'T', 'F' ], cpt: cptGrassWet }
];

export const edges = [
  { from: 'RAIN',      to: 'SPRINKLER' },
  { from: 'RAIN',      to: 'GRASS_WET' },
  { from: 'SPRINKLER', to: 'GRASS_WET' }
];
