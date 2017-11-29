import * as expect from 'expect';
import { inferences } from '../../src/index';
import { IInfer } from '../../src/types/index';
import { createNetwork } from '../../src/utils';
import { burglary, alarm, earthquake, johnCalls, maryCalls } from '../../models/alarm';

const { 
  enumeration, 
  junctionTree, 
  variableElimination 
} = inferences;

const network = createNetwork(burglary, earthquake, alarm, johnCalls, maryCalls);

const infersAlarmGiveBurglaryTrue = (infer: IInfer) => {
  const given = { 'BURGLARY': 'T' };

  expect(infer(network, { 'EARTHQUAKE': 'T' }, given).toFixed(4)).toBe('0.0020');
  expect(infer(network, { 'EARTHQUAKE': 'F' }, given).toFixed(4)).toBe('0.9980');
  expect(infer(network, { 'ALARM': 'T' }, given).toFixed(4)).toBe('0.9400');
  expect(infer(network, { 'ALARM': 'F' }, given).toFixed(4)).toBe('0.0600');
  expect(infer(network, { 'JOHN_CALLS': 'T' }, given).toFixed(4)).toBe('0.8490');
  expect(infer(network, { 'JOHN_CALLS': 'F' }, given).toFixed(4)).toBe('0.1510');
  expect(infer(network, { 'MARY_CALLS': 'T' }, given).toFixed(4)).toBe('0.6586');
  expect(infer(network, { 'MARY_CALLS': 'F' }, given).toFixed(4)).toBe('0.3414');
};

const infersAlarmGiveBurglaryFalse = (infer: IInfer) => {
  const given = { 'BURGLARY': 'F' };

  expect(infer(network, { 'EARTHQUAKE': 'T' }, given).toFixed(4)).toBe('0.0020');
  expect(infer(network, { 'EARTHQUAKE': 'F' }, given).toFixed(4)).toBe('0.9980');
  expect(infer(network, { 'ALARM': 'T' }, given).toFixed(4)).toBe('0.0016');
  expect(infer(network, { 'ALARM': 'F' }, given).toFixed(4)).toBe('0.9984');
  expect(infer(network, { 'JOHN_CALLS': 'T' }, given).toFixed(4)).toBe('0.0513');
  expect(infer(network, { 'JOHN_CALLS': 'F' }, given).toFixed(4)).toBe('0.9487');
  expect(infer(network, { 'MARY_CALLS': 'T' }, given).toFixed(4)).toBe('0.0111');
  expect(infer(network, { 'MARY_CALLS': 'F' }, given).toFixed(4)).toBe('0.9889');
};

const infersAlarmGiveEathQuakeTrue = (infer: IInfer) => {
  const given = { 'EARTHQUAKE': 'T' };

  expect(infer(network, { 'BURGLARY': 'T' }, given).toFixed(4)).toBe('0.0010');
  expect(infer(network, { 'BURGLARY': 'F' }, given).toFixed(4)).toBe('0.9990');
  expect(infer(network, { 'ALARM': 'T' }, given).toFixed(4)).toBe('0.2907');
  expect(infer(network, { 'ALARM': 'F' }, given).toFixed(4)).toBe('0.7093');
  expect(infer(network, { 'JOHN_CALLS': 'T' }, given).toFixed(4)).toBe('0.2971');
  expect(infer(network, { 'JOHN_CALLS': 'F' }, given).toFixed(4)).toBe('0.7029');
  expect(infer(network, { 'MARY_CALLS': 'T' }, given).toFixed(4)).toBe('0.2106');
  expect(infer(network, { 'MARY_CALLS': 'F' }, given).toFixed(4)).toBe('0.7894');
};

const infersAlarmGiveEathQuakeFalse = (infer: IInfer) => {
  const given = { 'EARTHQUAKE': 'F' };

  expect(infer(network, { 'BURGLARY': 'T' }, given).toFixed(4)).toBe('0.0010');
  expect(infer(network, { 'BURGLARY': 'F' }, given).toFixed(4)).toBe('0.9990');
  expect(infer(network, { 'ALARM': 'T' }, given).toFixed(4)).toBe('0.0019');
  expect(infer(network, { 'ALARM': 'F' }, given).toFixed(4)).toBe('0.9981');
  expect(infer(network, { 'JOHN_CALLS': 'T' }, given).toFixed(4)).toBe('0.0516');
  expect(infer(network, { 'JOHN_CALLS': 'F' }, given).toFixed(4)).toBe('0.9484');
  expect(infer(network, { 'MARY_CALLS': 'T' }, given).toFixed(4)).toBe('0.0113');
  expect(infer(network, { 'MARY_CALLS': 'F' }, given).toFixed(4)).toBe('0.9887');
};

const infersAlarmGiveAlarmTrue = (infer: IInfer) => {
  const given = { 'ALARM': 'T' };

  expect(infer(network, { 'BURGLARY': 'T' }, given).toFixed(4)).toBe('0.3736');
  expect(infer(network, { 'BURGLARY': 'F' }, given).toFixed(4)).toBe('0.6264');
  expect(infer(network, { 'EARTHQUAKE': 'T' }, given).toFixed(4)).toBe('0.2310');
  expect(infer(network, { 'EARTHQUAKE': 'F' }, given).toFixed(4)).toBe('0.7690');
  expect(infer(network, { 'JOHN_CALLS': 'T' }, given).toFixed(4)).toBe('0.9000');
  expect(infer(network, { 'JOHN_CALLS': 'F' }, given).toFixed(4)).toBe('0.1000');
  expect(infer(network, { 'MARY_CALLS': 'T' }, given).toFixed(4)).toBe('0.7000');
  expect(infer(network, { 'MARY_CALLS': 'F' }, given).toFixed(4)).toBe('0.3000');
};

const infersAlarmGiveAlarmFalse = (infer: IInfer) => {
  const given = { 'ALARM': 'F' };

  expect(infer(network, { 'BURGLARY': 'T' }, given).toFixed(4)).toBe('0.0001');
  expect(infer(network, { 'BURGLARY': 'F' }, given).toFixed(4)).toBe('0.9999');
  expect(infer(network, { 'EARTHQUAKE': 'T' }, given).toFixed(4)).toBe('0.0014');
  expect(infer(network, { 'EARTHQUAKE': 'F' }, given).toFixed(4)).toBe('0.9986');
  expect(infer(network, { 'JOHN_CALLS': 'T' }, given).toFixed(4)).toBe('0.0500');
  expect(infer(network, { 'JOHN_CALLS': 'F' }, given).toFixed(4)).toBe('0.9500');
  expect(infer(network, { 'MARY_CALLS': 'T' }, given).toFixed(4)).toBe('0.0100');
  expect(infer(network, { 'MARY_CALLS': 'F' }, given).toFixed(4)).toBe('0.9900');
};

const infersAlarmGiveJohnCallsTrue = (infer: IInfer) => {
  const given = { 'JOHN_CALLS': 'T' };

  expect(infer(network, { 'BURGLARY': 'T' }, given).toFixed(4)).toBe('0.0163');
  expect(infer(network, { 'BURGLARY': 'F' }, given).toFixed(4)).toBe('0.9837');
  expect(infer(network, { 'EARTHQUAKE': 'T' }, given).toFixed(4)).toBe('0.0114');
  expect(infer(network, { 'EARTHQUAKE': 'F' }, given).toFixed(4)).toBe('0.9886');
  expect(infer(network, { 'ALARM': 'T' }, given).toFixed(4)).toBe('0.0434');
  expect(infer(network, { 'ALARM': 'F' }, given).toFixed(4)).toBe('0.9566');
  expect(infer(network, { 'MARY_CALLS': 'T' }, given).toFixed(4)).toBe('0.0400');
  expect(infer(network, { 'MARY_CALLS': 'F' }, given).toFixed(4)).toBe('0.9600');
};

const infersAlarmGiveJohnCallsFalse = (infer: IInfer) => {
  const given = { 'JOHN_CALLS': 'F' };

  expect(infer(network, { 'BURGLARY': 'T' }, given).toFixed(4)).toBe('0.0002');
  expect(infer(network, { 'BURGLARY': 'F' }, given).toFixed(4)).toBe('0.9998');
  expect(infer(network, { 'EARTHQUAKE': 'T' }, given).toFixed(4)).toBe('0.0015');
  expect(infer(network, { 'EARTHQUAKE': 'F' }, given).toFixed(4)).toBe('0.9985');
  expect(infer(network, { 'ALARM': 'T' }, given).toFixed(4)).toBe('0.0003');
  expect(infer(network, { 'ALARM': 'F' }, given).toFixed(4)).toBe('0.9997');
  expect(infer(network, { 'MARY_CALLS': 'T' }, given).toFixed(4)).toBe('0.0102');
  expect(infer(network, { 'MARY_CALLS': 'F' }, given).toFixed(4)).toBe('0.9898');
};

const infersAlarmGiveMaryCallsTrue = (infer: IInfer) => {
  const given = { 'MARY_CALLS': 'T' };

  expect(infer(network, { 'BURGLARY': 'T' }, given).toFixed(4)).toBe('0.0561');
  expect(infer(network, { 'BURGLARY': 'F' }, given).toFixed(4)).toBe('0.9439');
  expect(infer(network, { 'EARTHQUAKE': 'T' }, given).toFixed(4)).toBe('0.0359');
  expect(infer(network, { 'EARTHQUAKE': 'F' }, given).toFixed(4)).toBe('0.9641');
  expect(infer(network, { 'ALARM': 'T' }, given).toFixed(4)).toBe('0.1501');
  expect(infer(network, { 'ALARM': 'F' }, given).toFixed(4)).toBe('0.8499');
  expect(infer(network, { 'JOHN_CALLS': 'T' }, given).toFixed(4)).toBe('0.1776');
  expect(infer(network, { 'JOHN_CALLS': 'F' }, given).toFixed(4)).toBe('0.8224');
};

const infersAlarmGiveMaryCallsFalse = (infer: IInfer) => {
  const given = { 'MARY_CALLS': 'F' };

  expect(infer(network, { 'BURGLARY': 'T' }, given).toFixed(4)).toBe('0.0003');
  expect(infer(network, { 'BURGLARY': 'F' }, given).toFixed(4)).toBe('0.9997');
  expect(infer(network, { 'EARTHQUAKE': 'T' }, given).toFixed(4)).toBe('0.0016');
  expect(infer(network, { 'EARTHQUAKE': 'F' }, given).toFixed(4)).toBe('0.9984');
  expect(infer(network, { 'ALARM': 'T' }, given).toFixed(4)).toBe('0.0008');
  expect(infer(network, { 'ALARM': 'F' }, given).toFixed(4)).toBe('0.9992');
  expect(infer(network, { 'JOHN_CALLS': 'T' }, given).toFixed(4)).toBe('0.0506');
  expect(infer(network, { 'JOHN_CALLS': 'F' }, given).toFixed(4)).toBe('0.9494');
};

const inferencesNames = {
  'Enumeration': enumeration.infer,
  'Junction Tree': junctionTree.infer,
  'Variable Elimination': variableElimination.infer,
};

const tests = {
  'infers give Burglary True': infersAlarmGiveBurglaryTrue,
  'infers give Burglary False': infersAlarmGiveBurglaryFalse,
  'infers give Eath Quake True': infersAlarmGiveEathQuakeTrue,
  'infers give Eath Quake False': infersAlarmGiveEathQuakeFalse,
  'infers give Alarm True': infersAlarmGiveAlarmTrue,
  'infers give Alarm False': infersAlarmGiveAlarmFalse,
  'infers give John Calls True': infersAlarmGiveJohnCallsTrue,
  'infers give John Calls False': infersAlarmGiveJohnCallsFalse,
  'infers give Mary Calls True': infersAlarmGiveMaryCallsTrue,
  'infers give Mary Calls False': infersAlarmGiveMaryCallsFalse,
}

describe('infers', () => {
  describe('alarm network', () => {  
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
