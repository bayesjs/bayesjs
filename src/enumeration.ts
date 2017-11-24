import equal from 'deep-equal';
import { INetwork, ICombinations } from './types'

const ICombinationsCache = new WeakMap();

export function infer(network: INetwork, nodes: ICombinations, giving?: ICombinations): number {
  let ICombinations: ICombinations[] = ICombinationsCache.get(network);

  if (ICombinations === undefined) {
    ICombinations = buildICombinations(network);
    ICombinationsCache.set(network, ICombinations);
  }

  let filteredICombinations: ICombinations[] = filterICombinations(ICombinations, nodes);
  let probGiving: number = 1;

  if (giving) {
    filteredICombinations = filterICombinations(filteredICombinations, giving);
    probGiving = infer(network, giving);
  }

  return calculateProbabilities(network, filteredICombinations) / probGiving;
}

function buildICombinations(network: INetwork): ICombinations[] {
  const ICombinations: ICombinations[] = [];

  makeICombinations(Object.keys(network));

  return ICombinations;

  function makeICombinations(nodes: string[], acc: ICombinations = {}): void {
    if (nodes.length === 0) {
      ICombinations.push(acc);
      return;
    }

    const [ node, ...rest ] = nodes;
    const states: string[] = network[node].states;

    for (let i = 0; i < states.length; i++) {
      const state: string = states[i];

      makeICombinations(rest, {
        ...acc,
        [node]: state
      });
    }
  }
}

function filterICombinations(ICombinations: ICombinations[], nodesToFilter: ICombinations): ICombinations[] {
  const idsToFilter = Object.keys(nodesToFilter);

  return ICombinations.filter(row => {
    for (let i = 0; i < idsToFilter.length; i++) {
      const idToFilter = idsToFilter[i];

      if (row[idToFilter] !== nodesToFilter[idToFilter]) {
        return false;
      }
    }

    return true;
  });
}

function calculateProbabilities(network: INetwork, ICombinations: ICombinations[]): number {
  const rowsProducts: number[] = [];

  for (let i = 0; i < ICombinations.length; i++) {
    let rowProduct = 1;

    const row = ICombinations[i];
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
