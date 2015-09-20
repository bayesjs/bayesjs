import chai from 'chai';
import BayesianNetwork from '../src/BayesianNetwork';
import { nodes, edges } from './RainSprinklerGrassWet';

chai.should();

describe('BayesianNetwork', function () {
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

  it('should infer single node', function () {
    let network = new BayesianNetwork();
    nodes.forEach(x => network.addNode(x));
    edges.forEach(x => network.addEdge(x));

    network.infer({node: 'RAIN', state: 'T'}).toFixed(4).should.be.equal('0.2000');
    network.infer({node: 'RAIN', state: 'F'}).toFixed(4).should.be.equal('0.8000');
    network.infer({node: 'SPRINKLER', state: 'T'}).toFixed(4).should.be.equal('0.3220');
    network.infer({node: 'SPRINKLER', state: 'F'}).toFixed(4).should.be.equal('0.6780');
    network.infer({node: 'GRASS_WET', state: 'T'}).toFixed(4).should.be.equal('0.4484');
    network.infer({node: 'GRASS_WET', state: 'F'}).toFixed(4).should.be.equal('0.5516');
  });

  it('should infer multiple nodes', function () {
    let network = new BayesianNetwork();
    nodes.forEach(x => network.addNode(x));
    edges.forEach(x => network.addEdge(x));

    let nodesToInfer = [
      {node: 'RAIN', state: 'T'},
      {node: 'SPRINKLER', state: 'T'},
      {node: 'GRASS_WET', state: 'T'}
    ];

    network.infer(nodesToInfer).toFixed(4).should.be.equal('0.0020');
  });

  it('should infer nodes giving other nodes', function () {
    let network = new BayesianNetwork();
    nodes.forEach(x => network.addNode(x));
    edges.forEach(x => network.addEdge(x));

    let nodeToInfer = {node: 'RAIN', state: 'T'};
    let giving = {node: 'GRASS_WET', state: 'T'};

    network.infer(nodeToInfer, giving).toFixed(4).should.be.equal('0.3577');
  });
});
