var BayesianNetwork = require('./bayes.js');

var cptRain = [
    {
        conditions: [],
        probabilities: [0.2, 0.8]
    }
];

var cptSprinkler = [
    {
        conditions: [{ parent: 'RAIN', state: 'F' }],
        probabilities: [0.4, 0.6]
    },
    {
        conditions: [{ parent: 'RAIN', state: 'T' }],
        probabilities: [0.01, 0.99]
    }
];

var cptGrassWet = [
    {
        conditions: [
            { parent: 'SPRINKLER', state: 'F' },
            { parent: 'RAIN', state: 'F' }
        ],
        probabilities: [0.0, 1.0]
    },
    {
        conditions: [
            { parent: 'SPRINKLER', state: 'F' },
            { parent: 'RAIN', state: 'T' }
        ],
        probabilities: [0.8, 0.2]
    },
    {
        conditions: [
            { parent: 'SPRINKLER', state: 'T' },
            { parent: 'RAIN', state: 'F' }
        ],
        probabilities: [0.9, 0.1]
    },
    {
        conditions: [
            { parent: 'SPRINKLER', state: 'T' },
            { parent: 'RAIN', state: 'T' }
        ],
        probabilities: [0.99, 0.01]
    }
];

var nodes = [
    { id: 'RAIN', states: ['T', 'F'], cpt: cptRain },
    { id: 'SPRINKLER', states: ['T', 'F'], cpt: cptSprinkler },
    { id: 'GRASS_WET', states: ['T', 'F'], cpt: cptGrassWet }
];

var edges = [
    { from: 'RAIN', to: 'SPRINKLER' },
    { from: 'RAIN', to: 'GRASS_WET' },
    { from: 'SPRINKLER', to: 'GRASS_WET' }
];

var network = new BayesianNetwork();

nodes.forEach(x => network.addNode(x));
edges.forEach(x => network.addEdge(x));

module.exports = function (node, state) {
    return network.infer({ node: node, state: state });
};
