import * as expect from 'expect';
import { inferences } from '../../src/index';
import { rain, sprinkler, grassWet } from '../../models/rain-sprinkler-grasswet';
import { IInfer } from '../../src/types/index';
import { createNetwork } from '../../src/utils';

const { 
  enumeration, 
  junctionTree, 
  variableElimination 
} = inferences;

const network = createNetwork(rain, sprinkler, grassWet);

const infersSingleNode = infer => {
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


const inferencesNames = {
  'Enumeration': enumeration.infer,
  'Junction Tree': junctionTree.infer,
  'Variable Elimination': variableElimination.infer,
};

const tests = {
  'infers single node': infersSingleNode,
  'infers multiples nodes': infersMultiplesNodes,
  'infers on nodes giving others': inferOnNodesGivingOthers,
}

describe('infers', () => {
  describe('default', () => {
    const testNames = Object.keys(tests);
    const inferNames = Object.keys(inferencesNames);

    for (const testName of testNames) {
      const method = tests[testName];

      for (const inferName of inferNames) {
        const infer = inferencesNames[inferName];

        it(`${testName} (${inferName})`, () => method(infer))
      }
    }
  });
});
