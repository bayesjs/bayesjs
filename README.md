[![Build Status](https://travis-ci.org/bayesjs/bayesjs.svg?branch=master)](https://travis-ci.org/bayesjs/bayesjs)
[![Coverage Status](https://coveralls.io/repos/github/bayesjs/bayesjs/badge.svg)](https://coveralls.io/github/bayesjs/bayesjs)
![npm bundle size](https://img.shields.io/bundlephobia/min/bayesjs)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)


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
