import * as equal from 'deep-equal';
import { INetwork, ICombinations, IInfer } from '../types'

const combinationsCache = new WeakMap();

export const infer: IInfer = (network: INetwork, nodes?: ICombinations, giving?: ICombinations): number => {
  let combinations: ICombinations[] = combinationsCache.get(network);

  if (combinations === undefined) {
    combinations = buildCombinations(network);
    combinationsCache.set(network, combinations);
  }

  let filteredCombinations: ICombinations[] = filterCombinations(combinations, nodes);
  let probGiving: number = 1;

  if (giving) {
    filteredCombinations = filterCombinations(filteredCombinations, giving);
    probGiving = infer(network, giving);
  }

  return calculateProbabilities(network, filteredCombinations) / probGiving;
}

function buildCombinations(network: INetwork): ICombinations[] {
  const combinations: ICombinations[] = [];

  makeCombinations(Object.keys(network));

  return combinations;

  function makeCombinations(nodes: string[], acc: ICombinations = {}): void {
    if (nodes.length === 0) {
      combinations.push(acc);
      return;
    }

    const [ node, ...rest ] = nodes;
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

function filterCombinations(combinations: ICombinations[], nodesToFilter: ICombinations): ICombinations[] {
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

function calculateProbabilities(network: INetwork, combinations: ICombinations[]): number {
  const rowsProducts: number[] = [];

  for (let i = 0; i < combinations.length; i++) {
    let rowProduct = 1;

    const row = combinations[i];
    const ids = Object.keys(row);

    for (let j = 0; j < ids.length; j++) {
      const nodeId = ids[j];
      const node = network[nodeId];
      const cpt = (<any>node.cpt);

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
