[![Build Status](https://travis-ci.org/bayesjs/bayesjs.svg?branch=master)](https://travis-ci.org/bayesjs/bayesjs)
[![Coverage Status](https://coveralls.io/repos/github/bayesjs/bayesjs/badge.svg)](https://coveralls.io/github/bayesjs/bayesjs)
![npm bundle size](https://img.shields.io/bundlephobia/min/bayesjs)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

# BayesJS

A inference library for [Bayesian Networks](https://en.wikipedia.org/wiki/Bayesian_network) made with [TypeScript](https://www.typescriptlang.org/).

## Inferences

Currently there are three inferences algorithms:

- [Junction tree algorithm](https://en.wikipedia.org/wiki/Junction_tree_algorithm)
- [Variable elimination](https://en.wikipedia.org/wiki/Variable_elimination)
- Enumeration

## Methods

#### infer(network: [INetwork](https://github.com/fhelwanger/bayesjs/blob/master/src/types/INetwork.ts), nodes?: [ICombinations](https://github.com/fhelwanger/bayesjs/blob/master/src/types/ICombinations.ts), given?: [ICombinations](https://github.com/fhelwanger/bayesjs/blob/master/src/types/ICombinations.ts)): number
Calculate the probability of a node's state.

This function receives a network, a node's state, and the knowing states and will return the probability of the node's state give.

As mentioned above, there are three inferences engines, by default the junction tree algorithm is used to execute the infer function.

It's important to remember that junction tree uses WeakMap to cache some internal results, if you are mutating the `network` or `given` object is advisable to shallow clone both objects before infer.
Read more about JT cache [here](#force)

```js
import { infer, inferences } from 'bayesjs';

infer(network, nodes, give); // Junction tree algorithm

inferences.enumeration.infer(network, nodes, give);
inferences.variableElimination.infer(network, nodes, give);
inferences.junctionTree.infer(network, nodes, give);
```

##### Example

Given the [rain-sprinkler-grasswet](https://github.com/fhelwanger/bayesjs/blob/master/models/rain-sprinkler-grasswet.ts) network. [Image here](https://en.wikipedia.org/wiki/Bayesian_network#/media/File:SimpleBayesNet.svg).

```js
import { infer } from 'bayesjs';

const network = // ...

// What is the probability that it is raining (RAIN = T)?
infer(network, { 'RAIN': 'T' }).toFixed(4) // 0.2000
// What is the probability that it is raining (RAIN = T), given the sprinkler is off (SPRINKLER = F)?
infer(network, { 'RAIN': 'T' }, { 'SPRINKLER': 'F' }).toFixed(4) // 0.2920
```

#### inferAll(network: [INetwork](https://github.com/fhelwanger/bayesjs/blob/master/src/types/INetwork.ts), given?: [ICombinations](https://github.com/fhelwanger/bayesjs/blob/master/src/types/ICombinations.ts), options?: [IInferAllOptions](https://github.com/fhelwanger/bayesjs/blob/master/src/types/IInferAllOptions.ts)): [INetworkResult](https://github.com/fhelwanger/bayesjs/blob/master/src/types/INetworkResult.ts))
Calculate all probabilities from a network and return an object with all results.

This function receives a network, the knowing states, and the options and will return an object with all results. This method will execute the junction tree algorithm on each node's state.

##### Options

##### force

default: `false`

Enforces to clear junction tree cache before inferring all network.
The junction tree uses [WeakMap](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) to store the `cliques` and `potentials` that are used at the algorithm.
- `cliques` weak stored by `network`
- `potentials` weak stored by `cliques` and `given`

This option is only necessary if you are mutation your `network` or `given` object instead of creating a new object before inferring each time.

##### precision

default: `8`

Rounds the network results according to this value. To round the value we are using [round-to](https://www.npmjs.com/package/round-to).


Some rounds examples:
- `0.30000000000000004`
  - 8 precision -> `0.3`
  - 4 precision -> `0.3`
  - 2 precision -> `0.3`
- `0.3333333333333333`
  - 8 precision -> `0.33333333`
  - 4 precision -> `0.3333`
  - 2 precision -> `0.33`
- `0.9802979902088171`
  - 8 precision -> `0.98029799`
  - 4 precision -> `0.9803`
  - 2 precision -> `0.98`


##### Example

```js
const network = {
  'Node 1': {
    id: 'Node 1',
    states: ['True', 'False'],
    parents: [],
    cpt: { True: 0.5, False: 0.5 },
  },
  'Node 2': {
    id: 'Node 2',
    states: ['True', 'False'],
    parents: [],
    cpt: { True: 0.5, False: 0.5 },
  },
  'Node 3': {
    id: 'Node 3',
    states: ['True', 'False'],
    parents: ['Node 2', 'Node 1'],
    cpt: [
      {
        when: { 'Node 2': 'True', 'Node 1': 'True' },
        then: { True: 0.5, False: 0.5 },
      },
      {
        when: { 'Node 2': 'False', 'Node 1': 'True' },
        then: { True: 0.5, False: 0.5 },
      },
      {
        when: { 'Node 2': 'True', 'Node 1': 'False' },
        then: { True: 0.5, False: 0.5 },
      },
      {
        when: { 'Node 2': 'False', 'Node 1': 'False' },
        then: { True: 0.5, False: 0.5 },
      },
    ],
  },
};

const given = { 'Node 1': 'True' }

inferAll(network, given)
// {
//   'Node 1': { True: 1, False: 0 },
//   'Node 2': { True: 0.5, False: 0.5 },
//   'Node 3': { True: 0.5, False: 0.5 },
// }

// Mutating the network...
network["Node 3"].cpt[0].then = { True: 0.95, False: 0.05 };

inferAll(network, given);
// Cached result - wrong
// {
//   'Node 1': { True: 1, False: 0 },
//   'Node 2': { True: 0.5, False: 0.5 },
//   'Node 3': { True: 0.5, False: 0.5 },
// }

inferAll(network, given, { force: true });
// {
//   'Node 1': { True: 1, False: 0 },
//   'Node 2': { True: 0.5, False: 0.5 },
//   'Node 3': { True: 0.725, False: 0.275 }
// }
```

#### addNode(network: [INetwork](https://github.com/fhelwanger/bayesjs/blob/master/src/types/INetwork.ts), node: [INode](https://github.com/fhelwanger/bayesjs/blob/master/src/types/INode.ts)): [INetwork](https://github.com/fhelwanger/bayesjs/blob/master/src/types/INetwork.ts)
Add a node in a Bayesian Network.

This function receives a network and a node, check if the node can be appended on the network. If something is wrong an exception will be thrown, otherwise, a new network will return with the node added.

##### Example

```js
import { addNode } from 'bayesjs';

const networkWithRainAndSprinkler = // ...

const grassWet = {
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

const newtwork = addNode(networkWithRainAndSprinkler, grassWet);
```

## License

MIT
