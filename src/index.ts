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

export * from './builder'
export const { infer } = junctionTree
export * from './types'
export * from './utils/inferAll'
export { HuginInferenceEngine as InferenceEngine } from './engines'
