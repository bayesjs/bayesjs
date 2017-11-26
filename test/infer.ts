import * as expect from 'expect';
import { addNode, inferences } from '../src/index';
import { rain, sprinkler, grassWet } from '../models/rain-sprinkler-grasswet';
import { IInfer } from '../src/types/index';

const { 
  enumeration, 
  junctionTree, 
  variableElimination 
} = inferences;

let network = {};

network = addNode(network, rain);
network = addNode(network, sprinkler);
network = addNode(network, grassWet);

const infersSingleNode = (infer) => {
  expect(infer(network, { 'RAIN': 'T' }).toFixed(4)).toBe('0.2000');
  expect(infer(network, { 'RAIN': 'F' }).toFixed(4)).toBe('0.8000');
  expect(infer(network, { 'SPRINKLER': 'T' }).toFixed(4)).toBe('0.3220');
  expect(infer(network, { 'SPRINKLER': 'F' }).toFixed(4)).toBe('0.6780');
  expect(infer(network, { 'GRASS_WET': 'T' }).toFixed(4)).toBe('0.4484');
  expect(infer(network, { 'GRASS_WET': 'F' }).toFixed(4)).toBe('0.5516');
};

const infersMultiplesNodes = (infer: IInfer) => {
  const nodesToInfer = {
    'RAIN': 'T',
    'SPRINKLER': 'T',
    'GRASS_WET': 'T'
  };

  expect(infer(network, nodesToInfer).toFixed(4)).toBe('0.0020');
};

const inferOnNodesGivingOthers = (infer: IInfer) => {
  const nodeToInfer = { 'RAIN': 'T' };
  const giving = { 'GRASS_WET': 'T' };

  expect(infer(network, nodeToInfer, giving).toFixed(4)).toBe('0.3577');
};

describe('infer', () => {
  it('infers single node (Enumeration)', () => infersSingleNode(enumeration.infer));
  it('infers single node (Junction Tree)', () => infersSingleNode(junctionTree.infer));
  it('infers single node (Variable Elimination)', () => infersSingleNode(variableElimination.infer));

  it('infers multiples nodes (Enumeration)', () => infersMultiplesNodes(enumeration.infer));
  it('infers multiples nodes (Junction Tree)', () => infersMultiplesNodes(junctionTree.infer));
  it('infers multiples nodes (Variable Elimination)', () => infersMultiplesNodes(variableElimination.infer));

  it('infers on nodes giving others (Enumeration)', () => inferOnNodesGivingOthers(enumeration.infer));
  it('infers on nodes giving others (Junction Tree)', () => inferOnNodesGivingOthers(junctionTree.infer));
  it('infers on nodes giving others (Variable Elimination)', () => inferOnNodesGivingOthers(variableElimination.infer));
});
