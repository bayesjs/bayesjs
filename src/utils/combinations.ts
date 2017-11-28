import { INetwork, ICombinations } from '../types/index';
import { isNull } from 'lodash';

const makeCombinations = (network: INetwork, combinations: ICombinations[], nodes: string[], acc = {}) => {
  if (nodes.length === 0) {
    combinations.push(acc);
    return;
  }
  
  const [ nodeId, ...rest ] = nodes;
  const states = network[nodeId].states;

  for (const state of states) {
    makeCombinations(network, combinations, rest, {
      ...acc,
      [nodeId]: state
    });
  }
};

export const buildCombinations = (network: INetwork, nodesToCombine?: string[]): ICombinations[] => {
  const combinations: ICombinations[] = [];

  makeCombinations(
    network,
    combinations,
    nodesToCombine ? nodesToCombine : Object.keys(network)
  );

  return combinations;
};
