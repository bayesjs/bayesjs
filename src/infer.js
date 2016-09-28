// @flow

import equal from 'deep-equal';

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

export function infer(network: Network, nodes: Combinations, giving: ?Combinations): number {
  const combinations: Combinations[] = buildCombinations(network);

  let filteredCombinations: Combinations[] = filterCombinations(combinations, nodes);
  let probGiving: number = 1;

  if (giving) {
    filteredCombinations = filterCombinations(filteredCombinations, giving);
    probGiving = infer(network, giving);
  }

  return calculateProbabilities(network, filteredCombinations) / probGiving;
}

function buildCombinations(network: Network): Combinations[] {
  const combinations: Combinations[] = [];

  makeCombinations(Object.keys(network));

  return combinations;

  function makeCombinations(nodes: string[], acc: Combinations = {}): void {
    if (nodes.length === 0) {
      combinations.push(acc);
      return;
    }

    const [ node: string, ...rest: string[] ] = nodes;
    const states: string[] = network[node].states;

    for (let i = 0; i < states.length; i++) {
      const state: string = states[i];

      makeCombinations(rest, {
        ...acc,
        [node]: state
      });
    }
  }
}

function filterCombinations(combinations: Combinations[], nodesToFilter: Combinations): Combinations[] {
  const idsToFilter = Object.keys(nodesToFilter);

  return combinations.filter(row => {
    for (let i = 0; i < idsToFilter.length; i++) {
      const idToFilter = idsToFilter[i];

      if (row[idToFilter] !== nodesToFilter[idToFilter]) {
        return false;
      }
    }

    return true;
  });
}

function calculateProbabilities(network: Network, combinations: Combinations[]): number {
  const rowsProducts: number[] = [];

  for (let i = 0; i < combinations.length; i++) {
    let rowProduct = 1;

    const row = combinations[i];
    const ids = Object.keys(row);

    for (let j = 0; j < ids.length; j++) {
      const nodeId = ids[j];
      const node = network[nodeId];
      const cpt = (node.cpt : any);

      if (node.parents.length === 0) {
        rowProduct *= cpt[row[nodeId]];
      } else {
        const when = {};

        for (let k = 0; k < node.parents.length; k++) {
          const parent = node.parents[k];
          when[parent] = row[parent];
        }

        for (let k = 0; k < cpt.length; k++) {
          const cptRow = cpt[k];
          if (equal(cptRow.when, when)) {
            rowProduct *= cptRow.then[row[nodeId]];
            break;
          }
        }
      }
    }

    rowsProducts.push(rowProduct);
  }

  let probability = 0;

  for (let i = 0; i < rowsProducts.length; i++) {
    probability += rowsProducts[i];
  }

  return probability;
}
