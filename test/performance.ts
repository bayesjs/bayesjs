import { addNode, inferences } from '../src/index';
import { IInfer, INode } from '../src/types/index';

const {
  enumeration,
  junctionTree,
  variableElimination,
} = inferences;

const createWhen = (parent: string, state: string) => {
  const when = {};
  when[parent] = state;

  return when;
};

const createThen = (states: string[]) => {
  const value = 1 / states.length;
  
  return states.reduce((acc, state) => {
    acc[state] = value;
    return acc;
  }, {});
}

const createCptStates = (n: number) => {
  const value = 1 / n;
  const states = Array.from({ length: n })
    .map((_, i) => i + 1)
    .map(x => x.toString());
  const cpt = states.reduce((json, state) => {
    json[state] = value;
    return json;
  }, {})

  return {
    states,
    cpt
  }
}

const createCptStatesWithParent = (n: number, parent: INode) => {
  const value = 1 / n;
  const states = Array.from({ length: n })
    .map((_, i) => `state_${i + 1}`);;
  const cpt = parent.states.map(state => ({
      when: createWhen(parent.id, state),
      then: createThen(states)
    }));

  return {
    states,
    cpt
  }
}

const createSuperNetwork = (numberNodes: number, numberCptStates: number = 7) => {
  let network = {};
  
  for (let i = 1; i <= numberNodes; i++) {
    const { cpt, states } = createCptStates(numberCptStates);
    
    network = addNode(network, {
      id: i.toString(),
      parents: [],
      states,
      cpt
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

  return network;
}

const createLineNetwork = (numberNodes: number, numberCptStates: number = 7) => {
  let network = {};
  let lastNode;
  
  for (let i = 1; i <= numberNodes; i++) {
    const { cpt, states } = lastNode
      ? createCptStatesWithParent(numberCptStates, lastNode)
      : createCptStates(numberCptStates);
    
    const newNode = {
      id: i.toString(),
      parents: lastNode ? [ lastNode.id ] : [],
      states,
      cpt
    };
    
    network = addNode(network, newNode);
    lastNode = newNode;
  }

  return network;
}

const inferSingleInAChainedNetwork = (netSize: number, infer: IInfer) => {
  const network = createLineNetwork(netSize, 4);

  infer(network, { '1': '1' });
};

const inferSingleNodeWithoutLastingForever = (netSize: number, infer: IInfer) => {
  const network = createSuperNetwork(netSize);

  infer(network, { 'AAA': '1' });
  infer(network, { '1': '1' });
  infer(network, { '2': '1' });
  infer(network, { '3': '1' });
};

const inferMultipleNodesWithoutLastingForever = (netSize: number, infer: IInfer) => {
  const network = createSuperNetwork(netSize);

  infer(network, { 'AAA': '1', '1': '1', '2': '1', '3': '1' });
}

const inferencesNames = {
  // 'Enumeration': enumeration.infer,
  'Variable Elimination': variableElimination.infer,
  'Junction Tree': junctionTree.infer,
};

const testsNames = {
  'infer single node without lasting forever': inferSingleNodeWithoutLastingForever,
  'infer multiple nodes without lasting forever': inferMultipleNodesWithoutLastingForever,
  'infer single in a chained network': inferSingleInAChainedNetwork,
};


describe('performance', () => {
  const infers = Object.keys(inferencesNames);
  const tests = Object.keys(testsNames);
  const networkSizes = Array.from({ length: 5 })
    .map((_, i) => (i * 25) + 25);

  // it('debug', () => {
  //   console.log(
  //     JSON.stringify(createSuperNetwork(3), null, 2)
  //   );
  // })

  for (const testName of tests) {
    const testMethod = testsNames[testName];

    for (const inferName of infers) {
      const infer = inferencesNames[inferName];

      for (const size of networkSizes) {
        it(`${testName} (${inferName} with ${size} nodes)`, () => testMethod(size, infer))
      }
    }
  }
});
