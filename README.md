[![Build Status](https://travis-ci.org/bayesjs/bayesjs.svg?branch=master)](https://travis-ci.org/bayesjs/bayesjs)
[![Coverage Status](https://coveralls.io/repos/github/bayesjs/bayesjs/badge.svg)](https://coveralls.io/github/bayesjs/bayesjs)
![npm bundle size](https://img.shields.io/bundlephobia/min/bayesjs)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

# BayesJS

A inference library for [Bayesian Networks](https://en.wikipedia.org/wiki/Bayesian_network) made with [TypeScript](https://www.typescriptlang.org/).   Our implementation makes use of Junction trees with lazy propagation to allow for fast recomputations of inferences (https://www.sciencedirect.com/science/article/pii/S0004370299000624).   This allows the user to provide or retract evidence, or replace the probability distributions for individual variables without recomputing the entire network.

This library also provides older implementations of probabilistic inteference based on [variable elimination](https://en.wikipedia.org/wiki/Variable_elimination) and enumeration.  These methods are deprecated and will be removed in future releases.

## Basic Usage

As an example, consider the Bayes network capture the beleifs about alarms and their reporting by customers of a centralized alarm service company:

![Alarm network](https://igi-web.tugraz.at/lehre/MLB/WS10/MLB_Exercises_2010/burglary.png)

Each node in this diagram represents a probability distribution on a random variable, while each arrow represents the conditioning of a variable at the head of the arrow on some parent variable at the tail.   The probability of each outcome is represented by a local distribution for each variable, and shown as a conditional probability table (CPT).   From this diagram you can see that John is more likely than Mary to call when no alarm has occured ( 5% vs 1% ), and that Burgularies are twice as likely as Earthquakes.    However, what if you want to know if an Earthquake had occurred, given that no alarm has been triggered, but Mary has called?   Making these kinds of inferences is fast and easy using bayesjs.

### Creating A New Network
You can use the bayesjs to create the Bayes Network structure in just a few lines of code:

```javascript
import { InferenceEngine } from 'bayesjs'

const network = {
  BURGULARY: { levels: ['T','F'], parents: []},
  EARTHQUAKE: { levels: ['T','F'], parents: []},
  ALARM: { levels: ['T','F'], parents: ['EARTHQUAKE','BURGULARY']},
  JOHN_CALLS: { levels:['T','F'], parents:['ALARM']},
  MARY_CALLS: { levels:['T','F'], parents:['ALARM']},
}

const engine = new InferenceEngine(network)
```

each entry in the network contains a definition for one of the random variables in the network, as well as the connections to its parents.   You can optionally specify the local distribution for each varible when you construct the network by providing a distribution, a conditional probability table or a potential function:

```javascript
const network = {
  BURGULARY: { levels: ['T', 'F'], parents: [], potentialFunction: [0.001, 0.999] },
  EARTHQUAKE: { levels: ['T', 'F'], parents: [], potentialFunction: [0.002, 0.998] },
  ALARM: { levels: ['T', 'F'], parents: ['EARTHQUAKE', 'BURGULARY'], potentialFunction: [0.95, 0.05, 0.94, 0.06, 0.29, 0.71, 0.001, 0.999] },
  JOHN_CALLS: { levels: ['T', 'F'], parents: ['ALARM'], potentialFunction: [0.9, 0.1, 0.05, 0.95] },
  MARY_CALLS: { levels: ['T', 'F'], parents: ['ALARM'], potentialFunction: [0.7, 0.3, 0.01, 0.99] },
}

const engine2 = new InferenceEngine(networkWithExplicitLocalDistributions)
```

If you do not provide an explicit local distribution for a variable, it will be populated with a uniform distribution.   Don't worry, bayesjs makes it easy to change the local distribution for any variable at any time.

### Structural Queries
Once you have created an inference engine, you can use the strucutural query methods to inspect the structure of the network.  The structural query methods are described below:

| method | arguments | description |
| --- | --- | --- |
| hasVariable | name: string | Test if the network has a variable with a name that matches the search term |
| hasLevel | name, level: string | Test if the network has a variable with the given name and that variable has the given level. |
| hasParent | name, parent: string | Test if the network has an arrow between the named parent and child variables. |
| getVariables | | Get a list of the names of all the variables in the network |
| getLevels | name: string | Get a list of all the levels of the given variable |
| getParents | | Get a list of all the edges in the network |
| getDistribution | name: string |  Get the local distribution for the named variable |

For example using the alarm network you can run the following structural queries:
```javascript
console.log( engine2.getVariables() )
console.log( engine2.hasParent('ALARM','EARTHQUAKE'))
console.log( engine2.getDistribution('ALARM').describe())
```
to produce the following results:
```
[ 'BURGULARY', 'EARTHQUAKE', 'ALARM', 'JOHN_CALLS', 'MARY_CALLS' ]

true

ALARM  | EARTHQUAKE BURGULARY || Probability
---------------------------------------------
    T  |          T         T || 9.5000e-1
    F  |          T         T || 5.0000e-2
---------------------------------------------
    T  |          F         T || 9.4000e-1
    F  |          F         T || 6.0000e-2
---------------------------------------------
    T  |          T         F || 2.9000e-1
    F  |          T         F || 7.1000e-1
---------------------------------------------
    T  |          F         F || 1.0000e-3
    F  |          F         F || 9.9900e-1
```

### Inference
You can use the inference engine's methods to make probabilistic inferences about
the variables in the network.   The probabilistic inference methods are
described below:

| method | arguments | description |
| --- | --- | --- |
| infer | event: { [name: string]: level} | Given a mapping from variable names to levels, infer the joint probability of observing the event subject to any evidence that has been provided.   |
| inferAll |  | Infer the marginal probability of each outcome for every variable in the network.     |
| hasEvidence | name: string | test if evidence has been provided for the given variable |
| getEvidence | name: string | get the evidence that was provided for the given variable |
| updateEvidence | evidence: { [name: string] : level } | Update the hard evidence provided for one or more
variables.   Any variables not mentioned in the input will retain their previous evidence. |
| setEvidence | evidence: { [name: string] : level } | Set the hard evidence provided for one or more
variables to the values provided.   Any variables not mentioned in the input will have their evidence removed. |
| removeEvidence | name: string } | Remove any evidence that has been provided for the given variable|
| removeAllEvidence | name: string } | Remove all evidence that has been provided for all variables |
| getJointDistribution | headVariables, parentVariables: string[] | Given a list of head variables and a list of parent variables, construct the joint distribution over the head variables conditioned upon the parent variables.   When evidence has been provided, the resulting joint distribution will be subject to that evidence |

For example using the alarm network you can run the following probabilistic inference queries:
```javascript
// given no other information, what is the likelihood that Mary calls?
console.log(engine.infer({ MARY_CALLS: 'T'}))
// given no other information, what is the likelihood of observing that Mary calls and there is an alarm?
console.log(engine.infer({ MARY_CALLS: 'T', ALARM: 'T'}))
// given no other information, what is the likelihood of observing that Mary calls and there is an alarm and an earthquake?
console.log(engine.infer({ MARY_CALLS: 'T', ALARM: 'T', 'EARTHQUAKE': 'T'}))

// Given that there is an earthquake, what is the likelihood of observing that Mary calls and there is an alarm?
engine.setEvidence({ EARTHQUAKE: 'T' })
console.log(engine.infer({ MARY_CALLS: 'T', ALARM: 'T' }))
```
which produces the following results:
```
0.01173634498
0.0017615093999999998
0.000406924
0.203462
```

You could also have used the 'getJointDistribution' to perform similar inferences:
```javascript
engine.removeAllEvidence()
    // construct the marginal distribution on MARY_CALLS
    const M = engine.getJointDistribution(['MARY_CALLS'], [])
    // construct the joint distribution on MARY_CALLS and ALARM
    const MA = engine.getJointDistribution(['MARY_CALLS', 'ALARM'], [])
    // construct the joint distribution on MARY_CALLS, ALARM and EARTHQUAKE
    const MAE = engine.getJointDistribution(['MARY_CALLS', 'ALARM', 'EARTHQUAKE'], [])
    // construct the joint distribution on MARY_CALLS, ALARM conditioned on EARTHQUAKE
    const MA_E = engine.getJointDistribution(['MARY_CALLS', 'ALARM'], ['EARTHQUAKE'])

    console.log(M.infer({ MARY_CALLS: 'T' }))
    console.log(MA.infer({ MARY_CALLS: 'T', ALARM: 'T' }))
    console.log(MAE.infer({ MARY_CALLS: 'T', ALARM: 'T', EARTHQUAKE: 'T' }))
    console.log(MA_E.infer({ MARY_CALLS: 'T', ALARM: 'T' }, { EARTHQUAKE: 'T' }))
```

When you wish to make repeated inferences on the same joint distribution, we
recommomend that you use getJointDistribution function to create a "stand alone"
object for that join.   For large networks this will offer the best runtime
performance.




## Inference Without An inference Engine
The bayesjs library exposes legacy functions for performing inference without creating an inference engine.
These functions do not make use of lazy propagation and evaluation, and are somewhat slower when you wish
to make repeated inferences.    These functions will likely be deprecated in future releases.

#### infer
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

```

## License

MIT
