// @flow

type CptWithoutParents = {
  [key: string]: number
};

type CptWithParentsItem = {
  when: { [key: string]: string },
  then: { [key: string]: number }
};

type CptWithParents = CptWithParentsItem[];

type Node = {
  id: string,
  states: string[],
  parents: string[],
  cpt: CptWithoutParents | CptWithParents
};

type Network = {
  [key: string]: Node
};

type Combinations = {
  [key: string]: string
};

type FactorItem = {
  states: { [nodeId: string]: string },
  value: number
};

type Factor = FactorItem[];

export function infer(network: Network, nodes: Combinations, giving: ?Combinations): number {
  const nodesToInfer = giving ? (
    { ...nodes, ...giving }
  ) : (
    nodes
  );

  const variables = Object.keys(network);
  const variablesToInfer = Object.keys(nodesToInfer);
  const variablesToEliminate = variables.filter(x => !variablesToInfer.some(y => y === x));

  const factors = variables.map(nodeId => buildFactor(network[nodeId]));

  while (variablesToEliminate.length > 0) {
    const varToEliminate = variablesToEliminate.shift();

    const factorsToJoin = factors.filter(factor => {
      return Object.keys(factor[0].states).some(nodeId => nodeId === varToEliminate);
    });

    const resultFactor = eliminateVariable(
      factorsToJoin.reduce((f1, f2) => joinFactors(f1, f2)),
      varToEliminate
    );

    for (let i = 0; i < factorsToJoin.length; i++) {
      factors.splice(factors.indexOf(factorsToJoin[i]), 1);
    }

    factors.push(resultFactor);
  }

  const joinedFactors = factors
    .filter(factor => Object.keys(factor[0].states).length > 0)
    .reduce((f1, f2) => {
      return joinFactors(f1, f2);
    });

  const inferenceRow = joinedFactors.find(row => {
    return variablesToInfer.every(v => row.states[v] === nodesToInfer[v]);
  });

  if (inferenceRow === undefined) {
    throw new Error('Fatal error');
  }

  const probGiving = giving ? (
    infer(network, giving)
  ) : (
    1
  );

  return inferenceRow.value / probGiving;
}

function buildFactor(node: Node): Factor {
  const factor = [];
  const cpt = (node.cpt : any);

  if (node.parents.length === 0) {
    for (let i = 0; i < node.states.length; i++) {
      const state = node.states[i];

      factor.push({
        states: { [node.id]: state },
        value: cpt[state]
      });
    }
  } else {
    for (let i = 0; i < cpt.length; i++) {
      for (let j = 0; j < node.states.length; j++) {
        const state = node.states[j];

        factor.push({
          states: { ...cpt[i].when, [node.id]: state },
          value: cpt[i].then[state]
        });
      }
    }
  }

  return factor;
}

function joinFactors(f1: Factor, f2: Factor): Factor {
  const newFactor = [];

  for (let i = 0; i < f1.length; i++) {
    for (let j = 0; j < f2.length; j++) {
      const states = {
        ...f1[i].states,
        ...f2[j].states
      };

      const nodeIds = Object.keys(states);

      const alreadyExists = newFactor.some(x => {
        return nodeIds.every(nodeId => x.states[nodeId] === states[nodeId]);
      });

      if (!alreadyExists) {
        newFactor.push({ states, value: 0 });
      }
    }
  }

  const nodeIdsF1 = Object.keys(f1[0].states);
  const nodeIdsF2 = Object.keys(f2[0].states);

  for (let i = 0; i < newFactor.length; i++) {
    const rowNewFactor = newFactor[i];

    const rowF1 = f1.find(x => {
      return nodeIdsF1.every(nodeId => x.states[nodeId] === rowNewFactor.states[nodeId]);
    });

    const rowF2 = f2.find(x => {
      return nodeIdsF2.every(nodeId => x.states[nodeId] === rowNewFactor.states[nodeId]);
    });

    if (rowF1 === undefined || rowF2 === undefined) {
      throw new Error('Fatal error');
    }

    rowNewFactor.value = rowF1.value * rowF2.value;
  }

  return newFactor;
}

function eliminateVariable(factor: Factor, variable: string): Factor {
  const newFactor = [];

  for (let i = 0; i < factor.length; i++) {
    const states = { ...factor[i].states };

    delete states[variable];

    const nodeIds = Object.keys(states);

    const existingRow = newFactor.find(x => {
      return nodeIds.every(nodeId => x.states[nodeId] === states[nodeId]);
    });

    if (existingRow === undefined) {
      newFactor.push({
        states,
        value: factor[i].value
      });
    } else {
      existingRow.value += factor[i].value;
    }
  }

  return newFactor;
}
