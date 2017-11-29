import * as expect from 'expect';
import { addNode, inferences } from '../src/index';
import { rain, sprinkler, grassWet } from '../models/rain-sprinkler-grasswet';
import { IInfer } from '../src/types/index';
import { createNetwork } from '../src/utils';
import { burglary, alarm, earthquake, johnCalls, maryCalls } from '../models/alarm';

const { 
  enumeration, 
  junctionTree, 
  variableElimination 
} = inferences;

const networkSprinkler = createNetwork(rain, sprinkler, grassWet);
const networkAlarm = createNetwork(burglary, earthquake, alarm, johnCalls, maryCalls);

const infersSingleNode = (infer) => {
  expect(infer(networkSprinkler, { 'RAIN': 'T' }).toFixed(4)).toBe('0.2000');
  expect(infer(networkSprinkler, { 'RAIN': 'F' }).toFixed(4)).toBe('0.8000');
  expect(infer(networkSprinkler, { 'SPRINKLER': 'T' }).toFixed(4)).toBe('0.3220');
  expect(infer(networkSprinkler, { 'SPRINKLER': 'F' }).toFixed(4)).toBe('0.6780');
  expect(infer(networkSprinkler, { 'GRASS_WET': 'T' }).toFixed(4)).toBe('0.4484');
  expect(infer(networkSprinkler, { 'GRASS_WET': 'F' }).toFixed(4)).toBe('0.5516');
};

const infersMultiplesNodes = (infer: IInfer) => {
  const nodesToInfer = {
    'RAIN': 'T',
    'SPRINKLER': 'T',
    'GRASS_WET': 'T'
  };

  expect(infer(networkSprinkler, nodesToInfer).toFixed(4)).toBe('0.0020');
};

const inferOnNodesGivingOthers = (infer: IInfer) => {
  const nodeToInfer = { 'RAIN': 'T' };
  const giving = { 'GRASS_WET': 'T' };

  expect(infer(networkSprinkler, { 'RAIN': 'T' }, { 'GRASS_WET': 'T' }).toFixed(4)).toBe('0.3577');
};

const infersGiveSprinklerTrue = (infer: IInfer) => {
  const given = { 'SPRINKLER': 'T' };

  expect(infer(networkSprinkler, { 'RAIN': 'T' }, given).toFixed(4)).toBe('0.0062');
  expect(infer(networkSprinkler, { 'RAIN': 'F' }, given).toFixed(4)).toBe('0.9938');
  expect(infer(networkSprinkler, { 'GRASS_WET': 'T' }, given).toFixed(4)).toBe('0.9006');
  expect(infer(networkSprinkler, { 'GRASS_WET': 'F' }, given).toFixed(4)).toBe('0.0994');
};

const infersGiveSprinklerFalse = (infer: IInfer) => {
  const given = { 'SPRINKLER': 'F' };

  expect(infer(networkSprinkler, { 'RAIN': 'T' }, given).toFixed(4)).toBe('0.2920');
  expect(infer(networkSprinkler, { 'RAIN': 'F' }, given).toFixed(4)).toBe('0.7080');
  expect(infer(networkSprinkler, { 'GRASS_WET': 'T' }, given).toFixed(4)).toBe('0.2336');
  expect(infer(networkSprinkler, { 'GRASS_WET': 'F' }, given).toFixed(4)).toBe('0.7664');
};

const infersGiveRainTrue = (infer: IInfer) => {
  const given = { 'RAIN': 'T' };

  expect(infer(networkSprinkler, { 'SPRINKLER': 'T' }, given).toFixed(4)).toBe('0.0100');
  expect(infer(networkSprinkler, { 'SPRINKLER': 'F' }, given).toFixed(4)).toBe('0.9900');
  expect(infer(networkSprinkler, { 'GRASS_WET': 'T' }, given).toFixed(4)).toBe('0.8019');
  expect(infer(networkSprinkler, { 'GRASS_WET': 'F' }, given).toFixed(4)).toBe('0.1981');
};

const infersGiveRainFalse = (infer: IInfer) => {
  const given = { 'RAIN': 'F' };

  expect(infer(networkSprinkler, { 'SPRINKLER': 'T' }, given).toFixed(4)).toBe('0.4000');
  expect(infer(networkSprinkler, { 'SPRINKLER': 'F' }, given).toFixed(4)).toBe('0.6000');
  expect(infer(networkSprinkler, { 'GRASS_WET': 'T' }, given).toFixed(4)).toBe('0.3600');
  expect(infer(networkSprinkler, { 'GRASS_WET': 'F' }, given).toFixed(4)).toBe('0.6400');
};

const infersGiveGrassWetTrue = (infer: IInfer) => {
  const given = { 'GRASS_WET': 'T' };

  expect(infer(networkSprinkler, { 'RAIN': 'T' }, given).toFixed(4)).toBe('0.3577');
  expect(infer(networkSprinkler, { 'RAIN': 'F' }, given).toFixed(4)).toBe('0.6423');
  expect(infer(networkSprinkler, { 'SPRINKLER': 'T' }, given).toFixed(4)).toBe('0.6467');
  expect(infer(networkSprinkler, { 'SPRINKLER': 'F' }, given).toFixed(4)).toBe('0.3533');
};

const infersGiveGrassWetFalse = (infer: IInfer) => {
  const given = { 'GRASS_WET': 'F' };

  expect(infer(networkSprinkler, { 'RAIN': 'T' }, given).toFixed(4)).toBe('0.0718');
  expect(infer(networkSprinkler, { 'RAIN': 'F' }, given).toFixed(4)).toBe('0.9282');
  expect(infer(networkSprinkler, { 'SPRINKLER': 'T' }, given).toFixed(4)).toBe('0.0580');
  expect(infer(networkSprinkler, { 'SPRINKLER': 'F' }, given).toFixed(4)).toBe('0.9420');
};

const infersAlarmGiveBurglaryTrue = (infer: IInfer) => {
  const given = { 'BURGLARY': 'T' };

  expect(infer(networkAlarm, { 'EARTHQUAKE': 'T' }, given).toFixed(4)).toBe('0.0020');
  expect(infer(networkAlarm, { 'EARTHQUAKE': 'F' }, given).toFixed(4)).toBe('0.9980');
  expect(infer(networkAlarm, { 'ALARM': 'T' }, given).toFixed(4)).toBe('0.9400');
  expect(infer(networkAlarm, { 'ALARM': 'F' }, given).toFixed(4)).toBe('0.0600');
  expect(infer(networkAlarm, { 'JOHN_CALLS': 'T' }, given).toFixed(4)).toBe('0.8490');
  expect(infer(networkAlarm, { 'JOHN_CALLS': 'F' }, given).toFixed(4)).toBe('0.1510');
  expect(infer(networkAlarm, { 'MARY_CALLS': 'T' }, given).toFixed(4)).toBe('0.6586');
  expect(infer(networkAlarm, { 'MARY_CALLS': 'F' }, given).toFixed(4)).toBe('0.3414');
};

const infersAlarmGiveBurglaryFalse = (infer: IInfer) => {
  const given = { 'BURGLARY': 'F' };

  expect(infer(networkAlarm, { 'EARTHQUAKE': 'T' }, given).toFixed(4)).toBe('0.0020');
  expect(infer(networkAlarm, { 'EARTHQUAKE': 'F' }, given).toFixed(4)).toBe('0.9980');
  expect(infer(networkAlarm, { 'ALARM': 'T' }, given).toFixed(4)).toBe('0.0016');
  expect(infer(networkAlarm, { 'ALARM': 'F' }, given).toFixed(4)).toBe('0.9984');
  expect(infer(networkAlarm, { 'JOHN_CALLS': 'T' }, given).toFixed(4)).toBe('0.0513');
  expect(infer(networkAlarm, { 'JOHN_CALLS': 'F' }, given).toFixed(4)).toBe('0.9487');
  expect(infer(networkAlarm, { 'MARY_CALLS': 'T' }, given).toFixed(4)).toBe('0.0111');
  expect(infer(networkAlarm, { 'MARY_CALLS': 'F' }, given).toFixed(4)).toBe('0.9889');
};

const infersAlarmGiveEathQuakeTrue = (infer: IInfer) => {
  const given = { 'EARTHQUAKE': 'T' };

  expect(infer(networkAlarm, { 'BURGLARY': 'T' }, given).toFixed(4)).toBe('0.0010');
  expect(infer(networkAlarm, { 'BURGLARY': 'F' }, given).toFixed(4)).toBe('0.9990');
  expect(infer(networkAlarm, { 'ALARM': 'T' }, given).toFixed(4)).toBe('0.2907');
  expect(infer(networkAlarm, { 'ALARM': 'F' }, given).toFixed(4)).toBe('0.7093');
  expect(infer(networkAlarm, { 'JOHN_CALLS': 'T' }, given).toFixed(4)).toBe('0.2971');
  expect(infer(networkAlarm, { 'JOHN_CALLS': 'F' }, given).toFixed(4)).toBe('0.7029');
  expect(infer(networkAlarm, { 'MARY_CALLS': 'T' }, given).toFixed(4)).toBe('0.2106');
  expect(infer(networkAlarm, { 'MARY_CALLS': 'F' }, given).toFixed(4)).toBe('0.7894');
};

const infersAlarmGiveEathQuakeFalse = (infer: IInfer) => {
  const given = { 'EARTHQUAKE': 'F' };

  expect(infer(networkAlarm, { 'BURGLARY': 'T' }, given).toFixed(4)).toBe('0.0010');
  expect(infer(networkAlarm, { 'BURGLARY': 'F' }, given).toFixed(4)).toBe('0.9990');
  expect(infer(networkAlarm, { 'ALARM': 'T' }, given).toFixed(4)).toBe('0.0019');
  expect(infer(networkAlarm, { 'ALARM': 'F' }, given).toFixed(4)).toBe('0.9981');
  expect(infer(networkAlarm, { 'JOHN_CALLS': 'T' }, given).toFixed(4)).toBe('0.0516');
  expect(infer(networkAlarm, { 'JOHN_CALLS': 'F' }, given).toFixed(4)).toBe('0.9484');
  expect(infer(networkAlarm, { 'MARY_CALLS': 'T' }, given).toFixed(4)).toBe('0.0113');
  expect(infer(networkAlarm, { 'MARY_CALLS': 'F' }, given).toFixed(4)).toBe('0.9887');
};

const infersAlarmGiveAlarmTrue = (infer: IInfer) => {
  const given = { 'ALARM': 'T' };

  expect(infer(networkAlarm, { 'BURGLARY': 'T' }, given).toFixed(4)).toBe('0.3736');
  expect(infer(networkAlarm, { 'BURGLARY': 'F' }, given).toFixed(4)).toBe('0.6264');
  expect(infer(networkAlarm, { 'EARTHQUAKE': 'T' }, given).toFixed(4)).toBe('0.2310');
  expect(infer(networkAlarm, { 'EARTHQUAKE': 'F' }, given).toFixed(4)).toBe('0.7690');
  expect(infer(networkAlarm, { 'JOHN_CALLS': 'T' }, given).toFixed(4)).toBe('0.9000');
  expect(infer(networkAlarm, { 'JOHN_CALLS': 'F' }, given).toFixed(4)).toBe('0.1000');
  expect(infer(networkAlarm, { 'MARY_CALLS': 'T' }, given).toFixed(4)).toBe('0.7000');
  expect(infer(networkAlarm, { 'MARY_CALLS': 'F' }, given).toFixed(4)).toBe('0.3000');
};

const infersAlarmGiveAlarmFalse = (infer: IInfer) => {
  const given = { 'ALARM': 'F' };

  expect(infer(networkAlarm, { 'BURGLARY': 'T' }, given).toFixed(4)).toBe('0.0001');
  expect(infer(networkAlarm, { 'BURGLARY': 'F' }, given).toFixed(4)).toBe('0.9999');
  expect(infer(networkAlarm, { 'EARTHQUAKE': 'T' }, given).toFixed(4)).toBe('0.0014');
  expect(infer(networkAlarm, { 'EARTHQUAKE': 'F' }, given).toFixed(4)).toBe('0.9986');
  expect(infer(networkAlarm, { 'JOHN_CALLS': 'T' }, given).toFixed(4)).toBe('0.0500');
  expect(infer(networkAlarm, { 'JOHN_CALLS': 'F' }, given).toFixed(4)).toBe('0.9500');
  expect(infer(networkAlarm, { 'MARY_CALLS': 'T' }, given).toFixed(4)).toBe('0.0100');
  expect(infer(networkAlarm, { 'MARY_CALLS': 'F' }, given).toFixed(4)).toBe('0.9900');
};

const infersAlarmGiveJohnCallsTrue = (infer: IInfer) => {
  const given = { 'JOHN_CALLS': 'T' };

  expect(infer(networkAlarm, { 'BURGLARY': 'T' }, given).toFixed(4)).toBe('0.0163');
  expect(infer(networkAlarm, { 'BURGLARY': 'F' }, given).toFixed(4)).toBe('0.9837');
  expect(infer(networkAlarm, { 'EARTHQUAKE': 'T' }, given).toFixed(4)).toBe('0.0114');
  expect(infer(networkAlarm, { 'EARTHQUAKE': 'F' }, given).toFixed(4)).toBe('0.9886');
  expect(infer(networkAlarm, { 'ALARM': 'T' }, given).toFixed(4)).toBe('0.0434');
  expect(infer(networkAlarm, { 'ALARM': 'F' }, given).toFixed(4)).toBe('0.9566');
  expect(infer(networkAlarm, { 'MARY_CALLS': 'T' }, given).toFixed(4)).toBe('0.0400');
  expect(infer(networkAlarm, { 'MARY_CALLS': 'F' }, given).toFixed(4)).toBe('0.9600');
};

const infersAlarmGiveJohnCallsFalse = (infer: IInfer) => {
  const given = { 'JOHN_CALLS': 'F' };

  expect(infer(networkAlarm, { 'BURGLARY': 'T' }, given).toFixed(4)).toBe('0.0002');
  expect(infer(networkAlarm, { 'BURGLARY': 'F' }, given).toFixed(4)).toBe('0.9998');
  expect(infer(networkAlarm, { 'EARTHQUAKE': 'T' }, given).toFixed(4)).toBe('0.0015');
  expect(infer(networkAlarm, { 'EARTHQUAKE': 'F' }, given).toFixed(4)).toBe('0.9985');
  expect(infer(networkAlarm, { 'ALARM': 'T' }, given).toFixed(4)).toBe('0.0003');
  expect(infer(networkAlarm, { 'ALARM': 'F' }, given).toFixed(4)).toBe('0.9997');
  expect(infer(networkAlarm, { 'MARY_CALLS': 'T' }, given).toFixed(4)).toBe('0.0102');
  expect(infer(networkAlarm, { 'MARY_CALLS': 'F' }, given).toFixed(4)).toBe('0.9898');
};

const infersAlarmGiveMaryCallsTrue = (infer: IInfer) => {
  const given = { 'MARY_CALLS': 'T' };

  expect(infer(networkAlarm, { 'BURGLARY': 'T' }, given).toFixed(4)).toBe('0.0561');
  expect(infer(networkAlarm, { 'BURGLARY': 'F' }, given).toFixed(4)).toBe('0.9439');
  expect(infer(networkAlarm, { 'EARTHQUAKE': 'T' }, given).toFixed(4)).toBe('0.0359');
  expect(infer(networkAlarm, { 'EARTHQUAKE': 'F' }, given).toFixed(4)).toBe('0.9641');
  expect(infer(networkAlarm, { 'ALARM': 'T' }, given).toFixed(4)).toBe('0.1501');
  expect(infer(networkAlarm, { 'ALARM': 'F' }, given).toFixed(4)).toBe('0.8499');
  expect(infer(networkAlarm, { 'JOHN_CALLS': 'T' }, given).toFixed(4)).toBe('0.1776');
  expect(infer(networkAlarm, { 'JOHN_CALLS': 'F' }, given).toFixed(4)).toBe('0.8224');
};

const infersAlarmGiveMaryCallsFalse = (infer: IInfer) => {
  const given = { 'MARY_CALLS': 'F' };

  expect(infer(networkAlarm, { 'BURGLARY': 'T' }, given).toFixed(4)).toBe('0.0003');
  expect(infer(networkAlarm, { 'BURGLARY': 'F' }, given).toFixed(4)).toBe('0.9997');
  expect(infer(networkAlarm, { 'EARTHQUAKE': 'T' }, given).toFixed(4)).toBe('0.0016');
  expect(infer(networkAlarm, { 'EARTHQUAKE': 'F' }, given).toFixed(4)).toBe('0.9984');
  expect(infer(networkAlarm, { 'ALARM': 'T' }, given).toFixed(4)).toBe('0.0008');
  expect(infer(networkAlarm, { 'ALARM': 'F' }, given).toFixed(4)).toBe('0.9992');
  expect(infer(networkAlarm, { 'JOHN_CALLS': 'T' }, given).toFixed(4)).toBe('0.0506');
  expect(infer(networkAlarm, { 'JOHN_CALLS': 'F' }, given).toFixed(4)).toBe('0.9494');
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
  '[Sprinkler] infers give Sprinkler True': infersGiveSprinklerTrue,
  '[Sprinkler] infers give Sprinkler False': infersGiveSprinklerFalse,
  '[Sprinkler] infers give Rain True': infersGiveRainTrue,
  '[Sprinkler] infers give Rain False': infersGiveRainFalse,
  '[Sprinkler] infers give Grass Wet True': infersGiveGrassWetTrue,
  '[Sprinkler] infers give Grass Wet False': infersGiveGrassWetFalse,
  '[Alarm] infers give Burglary True': infersAlarmGiveBurglaryTrue,
  '[Alarm] infers give Burglary False': infersAlarmGiveBurglaryFalse,
  '[Alarm] infers give Eath Quake True': infersAlarmGiveEathQuakeTrue,
  '[Alarm] infers give Eath Quake False': infersAlarmGiveEathQuakeFalse,
  '[Alarm] infers give Alarm True': infersAlarmGiveAlarmTrue,
  '[Alarm] infers give Alarm False': infersAlarmGiveAlarmFalse,
  '[Alarm] infers give John Calls True': infersAlarmGiveJohnCallsTrue,
  '[Alarm] infers give John Calls False': infersAlarmGiveJohnCallsFalse,
  '[Alarm] infers give Mary Calls True': infersAlarmGiveMaryCallsTrue,
  '[Alarm] infers give Mary Calls False': infersAlarmGiveMaryCallsFalse,
}

describe('infer', () => {
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
