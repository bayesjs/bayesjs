import chai from 'chai';
import BayesianNetwork from '../src';

chai.should();

describe('BayesianNetwork', function () {
  let cptRain = [
    {
      conditions: [],
      probabilities: [ 0.2, 0.8 ]
    }
  ];

  let cptSprinkler = [
    {
      conditions: [ { parent: 'RAIN', state: 'F'} ],
      probabilities: [ 0.4, 0.6 ]
    },
    {
      conditions: [ { parent: 'RAIN', state: 'T'} ],
      probabilities: [ 0.01, 0.99 ]
    }
  ];

  let cptGrassWet = [
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

  let nodes = [
    { id: 'RAIN',      states: [ 'T', 'F' ], cpt: cptRain },
    { id: 'SPRINKLER', states: [ 'T', 'F' ], cpt: cptSprinkler },
    { id: 'GRASS_WET', states: [ 'T', 'F' ], cpt: cptGrassWet }
  ];

  let edges = [
    { from: 'RAIN',      to: 'SPRINKLER' },
    { from: 'RAIN',      to: 'GRASS_WET' },
    { from: 'SPRINKLER', to: 'GRASS_WET' }
  ];

  it('should add new node', function () {
    let network = new BayesianNetwork();

    nodes.forEach(x => network.addNode(x));

    network.nodes.forEach((x, i) => x.should.be.equal(nodes[i]));
    network.nodes.length.should.be.equal(nodes.length);
  });

  it('should add edges', function () {
    let network = new BayesianNetwork();

    nodes.forEach(x => network.addNode(x));
    edges.forEach(x => network.addEdge(x));

    network.edges.forEach((x, i) => x.should.be.equal(edges[i]));
    network.edges.length.should.be.equal(edges.length);
  });

  it('can find node', function () {
    let network = new BayesianNetwork();
    nodes.forEach(x => network.addNode(x));

    let node = network.findNodeById(nodes[0].id);

    node.id.should.be.equal(nodes[0].id);
  });

  it('can find parents', function () {
    let network = new BayesianNetwork();
    nodes.forEach(x => network.addNode(x));
    edges.forEach(x => network.addEdge(x));

    let parents = network.findParentsByChildId(nodes[2].id);

    parents[0].should.be.equal('RAIN');
    parents[1].should.be.equal('SPRINKLER');
    parents.length.should.be.equal(2);
  });

  it('should infer', function () {
    let network = new BayesianNetwork();
    nodes.forEach(x => network.addNode(x));
    edges.forEach(x => network.addEdge(x));

    network.infer('RAIN', 'T').toFixed(4).should.be.equal('0.2000');
    network.infer('RAIN', 'F').toFixed(4).should.be.equal('0.8000');
    network.infer('SPRINKLER', 'T').toFixed(4).should.be.equal('0.3220');
    network.infer('SPRINKLER', 'F').toFixed(4).should.be.equal('0.6780');
    network.infer('GRASS_WET', 'T').toFixed(4).should.be.equal('0.4484');
    network.infer('GRASS_WET', 'F').toFixed(4).should.be.equal('0.5516');
  });
});
