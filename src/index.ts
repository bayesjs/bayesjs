import * as enumeration from './enumeration'
import * as junctionTree from './junctionTree'
import * as variableElimination from './variableElimination'

export const inferences =  {
  enumeration,
  junctionTree,
  variableElimination,
}

export * from './builder';
export const infer = junctionTree.infer;