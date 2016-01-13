import expect from 'expect';
import { addNode, infer } from '../src/index';
import { rain, sprinkler, grassWet } from '../models/rain-sprinkler-grasswet';

let network = {};

network = addNode(network, rain);
network = addNode(network, sprinkler);
network = addNode(network, grassWet);

describe('infer', () => {
  it('infers single node', () => {
    expect(infer(network, { 'RAIN': 'T' }).toFixed(4)).toBe('0.2000');
    expect(infer(network, { 'RAIN': 'F' }).toFixed(4)).toBe('0.8000');
    expect(infer(network, { 'SPRINKLER': 'T' }).toFixed(4)).toBe('0.3220');
    expect(infer(network, { 'SPRINKLER': 'F' }).toFixed(4)).toBe('0.6780');
    expect(infer(network, { 'GRASS_WET': 'T' }).toFixed(4)).toBe('0.4484');
    expect(infer(network, { 'GRASS_WET': 'F' }).toFixed(4)).toBe('0.5516');
  });

  it('infers multiples nodes', () => {
    const nodesToInfer = {
      'RAIN': 'T',
      'SPRINKLER': 'T',
      'GRASS_WET': 'T'
    };

    expect(infer(network, nodesToInfer).toFixed(4)).toBe('0.0020');
  });

  it('infers on nodes giving others', () => {
    const nodeToInfer = { 'RAIN': 'T' };
    const giving = { 'GRASS_WET': 'T' };

    expect(infer(network, nodeToInfer, giving).toFixed(4)).toBe('0.3577');
  });
});
