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
