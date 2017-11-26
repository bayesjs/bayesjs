import { 
  INetwork, 
  ICombinations,
  IFactor,
  IFactorItem,
  INode,
  IInfer
} from '../types/index';

export const infer: IInfer = (network: INetwork, nodes: ICombinations, giving?: ICombinations): number => {
  const variables = Object.keys(network);
  const variablesToInfer = Object.keys(nodes);
  const variablesGiving = giving ? Object.keys(giving) : [];

  const variablesToEliminate = variables
    .filter(x => !variablesToInfer.some(y => y === x) && !variablesGiving.some(y => y === x));

  const IFactors = variables
    .map(nodeId => buildIFactor(network[nodeId], giving));

  while (variablesToEliminate.length > 0) {
    const varToEliminate = variablesToEliminate.shift();

    const IFactorsToJoin = IFactors.filter(IFactor => {
      return Object.keys(IFactor[0].states).some(nodeId => nodeId === varToEliminate);
    });

    const resultIFactor = eliminateVariable(
      IFactorsToJoin.reduce((f1, f2) => joinIFactors(f1, f2)),
      varToEliminate
    );

    for (let i = 0; i < IFactorsToJoin.length; i++) {
      IFactors.splice(IFactors.indexOf(IFactorsToJoin[i]), 1);
    }

    IFactors.push(resultIFactor);
  }

  const joinedIFactor = IFactors
    .filter(IFactor => Object.keys(IFactor[0].states).length > 0)
    .sort((f1, f2) => f1.length - f2.length)
    .reduce((f1, f2) => {
      return joinIFactors(f1, f2);
    });

  const normalizedIFactor = normalizeIFactor(joinedIFactor);

  const inferenceRow = normalizedIFactor.find(row => {
    return variablesToInfer.every(v => row.states[v] === nodes[v]);
  });

  if (inferenceRow === undefined) {
    return 0;
  }

  return inferenceRow.value;
}

function buildIFactor(node: INode, giving?: ICombinations): IFactor {
  const IFactor = [];
  const cpt = (<any>node.cpt);

  if (node.parents.length === 0) {
    for (let i = 0; i < node.states.length; i++) {
      const state = node.states[i];

      IFactor.push({
        states: { [node.id]: state },
        value: cpt[state]
      });
    }
  } else {
    for (let i = 0; i < cpt.length; i++) {
      for (let j = 0; j < node.states.length; j++) {
        const state = node.states[j];

        IFactor.push({
          states: { ...cpt[i].when, [node.id]: state },
          value: cpt[i].then[state]
        });
      }
    }
  }

  if (giving) {
    const givingIds = Object.keys(giving);

    for (let i = IFactor.length - 1; i >= 0; i--) {
      for (let j = 0; j < givingIds.length; j++) {
        const givingId = givingIds[j];

        if (IFactor[i].states[givingId] && IFactor[i].states[givingId] !== giving[givingId]) {
          IFactor.splice(i, 1);
          break;
        }
      }
    }
  }

  return IFactor;
}

function joinIFactors(f1: IFactor, f2: IFactor): IFactor {
  const newIFactor = [];

  for (let i = 0; i < f1.length; i++) {
    for (let j = 0; j < f2.length; j++) {
      const states = {
        ...f1[i].states,
        ...f2[j].states
      };

      const nodeIds = Object.keys(states);

      const alreadyExists = newIFactor.some(x => {
        return nodeIds.every(nodeId => x.states[nodeId] === states[nodeId]);
      });

      if (!alreadyExists) {
        newIFactor.push({ states, value: 0 });
      }
    }
  }

  const nodeIdsF1 = Object.keys(f1[0].states);
  const nodeIdsF2 = Object.keys(f2[0].states);

  for (let i = 0; i < newIFactor.length; i++) {
    const rowNewIFactor = newIFactor[i];

    const rowF1 = f1.find(x => {
      return nodeIdsF1.every(nodeId => x.states[nodeId] === rowNewIFactor.states[nodeId]);
    });

    const rowF2 = f2.find(x => {
      return nodeIdsF2.every(nodeId => x.states[nodeId] === rowNewIFactor.states[nodeId]);
    });

    if (rowF1 === undefined || rowF2 === undefined) {
      throw new Error('Fatal error');
    }

    rowNewIFactor.value = rowF1.value * rowF2.value;
  }

  return newIFactor;
}

function eliminateVariable(IFactor: IFactor, variable: string): IFactor {
  const newIFactor = [];

  for (let i = 0; i < IFactor.length; i++) {
    const states = { ...IFactor[i].states };

    delete states[variable];

    const nodeIds = Object.keys(states);

    const existingRow = newIFactor.find(x => {
      return nodeIds.every(nodeId => x.states[nodeId] === states[nodeId]);
    });

    if (existingRow === undefined) {
      newIFactor.push({
        states,
        value: IFactor[i].value
      });
    } else {
      existingRow.value += IFactor[i].value;
    }
  }

  return newIFactor;
}

function normalizeIFactor(IFactor: IFactor): IFactor {
  const total = IFactor.reduce((acc, row) => acc + row.value, 0);

  if (total === 0) {
    return IFactor;
  }

  return IFactor
    .map(row => ({
      states: { ...row.states },
      value: row.value / total
    }));
}
