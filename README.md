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

This function receives a network, and will return the probability of the node having the given state subject to the given evidence.

As mentioned above, there are three inferences engines, by default the junction tree algorithm is used to execute the infer function.

If you want to perform repeated inferences from the same bayes network, you should consider instanciating an inference engine for
that network.
```js
import { infer, inferences } from 'bayesjs';

infer(network, event, evidence); // Junction tree algorithm

inferences.enumeration.infer(network, event, evidence);
inferences.variableElimination.infer(network, event, evidence);
inferences.junctionTree.infer(network, event, evidence);
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
Calculate the marginal distributions for a given network subject to some given evidence.

This method will execute the junction tree algorithm on each node's state.

##### Options

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

const evidence = { 'Node 1': 'True' }

inferAll(network, evidence)
// {
//   'Node 1': { True: 1, False: 0 },
//   'Node 2': { True: 0.5, False: 0.5 },
//   'Node 3': { True: 0.5, False: 0.5 },
// }

// Mutating the network...
network["Node 3"].cpt[0].then = { True: 0.95, False: 0.05 };

inferAll(network, evidence);
// {
//   'Node 1': { True: 1, False: 0 },
//   'Node 2': { True: 0.5, False: 0.5 },
//   'Node 3': { True: 0.725, False: 0.275 }
// }
```

#### [IInferenceEngines](https://github.com/fhelwanger/bayesjs/blob/master/src/types/IInferenceEngine.ts))
Inference engines provide an efficient way of performing repeated inferences on the same Bayesian network.  Currently there
is one inference engine provided:

* [HuginInferenceEngine](https://github.com/dlewissandy/bayesjs/blob/feature/inference-engines/src/inferences/junctionTree/hugin-inference-engine.ts)) - An inference engine that uses the junction tree algorithm for infereneces, caching the network topology and potentials for efficiency.

Each engine can be ititialized by calling the constructor with the desired network.  The example below
shows how to perform efficient repeated inference on the Alarm bayes network.:
```js
import { HuginInferenceEngine } from 'bayesjs'
import { allNodes } from './models/alarm.ts'

const network = createNetwork(...allNodes )
const engine = HuginInferenceEngine( network )

// Make multiple inferences with the network without inferences
console.log( engine.infer({ 'JOHN_CALLS': 'T' })) // 0.0521
console.log( engine.infer({ 'MARY_CALLS': 'T' })) // 0.0117
console.log( engine.getEvidence ) // { }

// inject some evidence and make multiple inferences
engine.setEvidence({ 'EARTHQUAKE': 'T' } )
console.log( engine.infer({ 'JOHN_CALLS': 'T' })) // 0.2971
console.log( engine.infer({ 'MARY_CALLS': 'T' })) // 0.2106
console.log( engine.getEvidence ) // { 'EARTHQUAKE': 'T' }

// Update the distribution for a node and make some inferences
engine.setDistribution('BURGLARY', { T: 0.05, F: 0.95 })
console.log( engine.infer({ 'JOHN_CALLS': 'T' })) // 0.3246
console.log( engine.infer({ 'MARY_CALLS': 'T' })) // 0.2329
console.log( engine.getEvidence ) // { 'EARTHQUAKE': 'T' }

// incrementally add additional evidence and make multiple inferences
engine.setEvidence({ 'ALARM': 'T' } )
console.log( engine.infer({ 'JOHN_CALLS': 'T' })) // 0.9000
console.log( engine.infer({ 'MARY_CALLS': 'T' })) // 0.7000
console.log( engine.getEvidence ) // { 'ALARM': 'T', 'EARTHQUAKE': 'T' }

// Remove all the evidence and make multiple inferences.
engine.removeAllEvidence()
console.log( engine.infer({ 'JOHN_CALLS': 'T' })) // 0.0912
console.log( engine.infer({ 'MARY_CALLS': 'T' })) // 0.0435
console.log( engine.getEvidence ) // { }
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
