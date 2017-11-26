import {
  enumeration,
  junctionTree,
  variableElimination,
} from './inferences/index';

export const inferences =  {
  enumeration,
  junctionTree,
  variableElimination,
}

export * from './builder';
export const infer = junctionTree.infer;