import { addNode, infer } from '../src/index';

let network = {};

for (let i = 1; i <= 100; i++) {
  network = addNode(network, {
    id: i.toString(),
    states: [ '1', '2', '3', '4', '5', '6', '7' ],
    parents: [],
    cpt: { '1': 0.1, '2': 0.1, '3': 0.1, '4': 0.1, '5': 0.1, '6': 0.1, '7': 0.4 }
  });
}

network = addNode(network, {
  id: 'AAA',
  states: [ '1', '2', '3', '4' ],
  parents: [ '3' ],
  cpt: [
    { when: { '3': '1' }, then: { '1': 0.25, '2': 0.25, '3': 0.25, '4': 0.25 } },
    { when: { '3': '2' }, then: { '1': 0.25, '2': 0.25, '3': 0.25, '4': 0.25 } },
    { when: { '3': '3' }, then: { '1': 0.25, '2': 0.25, '3': 0.25, '4': 0.25 } },
    { when: { '3': '4' }, then: { '1': 0.25, '2': 0.25, '3': 0.25, '4': 0.25 } },
    { when: { '3': '5' }, then: { '1': 0.25, '2': 0.25, '3': 0.25, '4': 0.25 } },
    { when: { '3': '6' }, then: { '1': 0.25, '2': 0.25, '3': 0.25, '4': 0.25 } },
    { when: { '3': '7' }, then: { '1': 0.25, '2': 0.25, '3': 0.25, '4': 0.25 } }
  ]
});

describe('perf', () => {
  it('infer single node without lasting forever', () => {
    infer(network, { 'AAA': '1' });
    infer(network, { '1': '1' });
    infer(network, { '2': '1' });
    infer(network, { '3': '1' });
  });

  it('infer multiple nodes without lasting forever', () => {
    infer(network, { 'AAA': '1', '1': '1', '2': '1', '3': '1' });
  });
});
