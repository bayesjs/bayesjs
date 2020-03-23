import {
  enumeration,
  junctionTree,
  variableElimination,
} from './inferences'

export const inferences = {
  enumeration,
  junctionTree,
  variableElimination,
}
export * from './types'

export * from './builder'

export const { infer } = junctionTree
