import { InferenceEngine, FastPotential } from '..'
import { TowerOfDerivatives } from './TowerOfDerivatives'
import { StepStatus, StepResult } from './StepResult'
import { ObjectiveFunction } from './objective-functions/ObjectiveFunction'
import { restoreEngine } from '../engines/util'

/** Given an inference engine, a tower of derivatives and an objective
 * function return a result containing the tower of derivatives
 * at the specified distance along the ascent vector from the current
 * set of parameters.
 * @param engine - An inference engine containing the Bayes network of
 *   interest
 * @param current - The tower of derivatives at the current set of
 *   parameters
 * @param stepSize - The magnitude of the step to take along the ascent
 *   direction away from the current set of parameters
 * @param objectiveFn - The objective function being maximized.
 * NOTE: This function assumes that the Hessian matrix is well conditioned
 * and negative definite at the current set of parameters.  This
 * precondition is not checked, and must be satisfied by the caller.
 */
export function newtonStep (
  engine: InferenceEngine,
  current: TowerOfDerivatives,
  stepSize: number,
  objectiveFn: ObjectiveFunction,
): StepResult {
  const newtonDirection = current.ascentDirection
  // Compute the new potentials at the specified distance along the
  // ascent direction.
  const trialXs: FastPotential[] = current.xs.map((ps, i) => ps.map((p, jk) => p - stepSize * newtonDirection[i][jk]))
  // Restore the inference engine to the trial set of parameters to
  // facilitate making probabilistic inferences.
  restoreEngine(engine, trialXs, {})
  // Construct the tower of derivatives and the step result.
  return { tower: objectiveFn(engine), stepSize, status: StepStatus.STEP_TAKEN_TOWARD_MAXIMIZER }
}
