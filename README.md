# bayesjs

Inference on Bayesian Networks

# Example

```js
// First of all, we define the CPTs of each node
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

// Then we define the nodes and the edges
const nodes = [
  { id: 'RAIN',      states: [ 'T', 'F' ], cpt: cptRain },
  { id: 'SPRINKLER', states: [ 'T', 'F' ], cpt: cptSprinkler },
  { id: 'GRASS_WET', states: [ 'T', 'F' ], cpt: cptGrassWet }
];

const edges = [
  { from: 'RAIN',      to: 'SPRINKLER' },
  { from: 'RAIN',      to: 'GRASS_WET' },
  { from: 'SPRINKLER', to: 'GRASS_WET' }
];

// Then we create a Bayesian Network, adding each node and edge to it
let network = new BayesianNetwork();

nodes.forEach(x => network.addNode(x));
edges.forEach(x => network.addEdge(x));

// Inference on single node
network.infer({node: 'RAIN', state: 'T'}).toFixed(4); // "0.2000"
network.infer({node: 'GRASS_WET', state: 'T'}).toFixed(4); // "0.4484"

// Inference on multiples nodes occurring simultaneously
let nodesToInfer = [
  {node: 'RAIN', state: 'T'},
  {node: 'SPRINKLER', state: 'T'},
  {node: 'GRASS_WET', state: 'T'}
];

network.infer(nodesToInfer).toFixed(4); // "0.0020"

// Inference on some nodes, knowing the state of others
network.infer({node: 'RAIN', state: 'T'}, /* giving */ {node: 'GRASS_WET', state: 'T'}).toFixed(4); // "0.3577"
```
