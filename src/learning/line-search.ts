import { InferenceEngine } from '..'
import { TowerOfDerivatives } from './TowerOfDerivatives'
import { StepResult, StepStatus } from './StepResult'
import { newtonStep } from './newton-step'
import { ObjectiveFunction } from './objective-functions/ObjectiveFunction'
import { SQRTEPS, CUBEROOTEPS } from './vector-utils'
import { restoreEngine } from '../engines/util'

const ALPHA = CUBEROOTEPS
const BETA = 0.9

type LineSearchCoordinate = {
  stepSize: number;
  tower: TowerOfDerivatives;
}

function relativeLength (current: TowerOfDerivatives): number {
  return current.xs.reduce((accI, ps, i) =>
    Math.max(accI, ps.reduce((accJK, p, jk) => Math.max(accJK,
      Math.abs(current.ascentDirection[i][jk]) / Math.max(current.xs[i][jk], SQRTEPS),
    ), 0),
    ), 0)
}

/** Given the current best maximizer for the objective function, and a trial
 * maximizer for the objective function which does not satisfy the
 * Armijo Goldstien criteria, attempt to find a better step size
 * and trial maximizer by approximating the objective function as a hermite
 * cubic function of the step size.
 *
 * where (x0,y0,m0) and (x1,y1,m1) are the step size, objective function and
 * material derivatives at two know points, and a, b, c and d are the coefficients
 * of the cubic function.

 * @param current: The current tower of derivatives
 * @param trial: The next trial solution for the maximizer of the objective function
 *
 * NOTE: If a real valued maximizer is not found, this function falls back to
 *   the average step size of the two inputs.
 */
function interpolateStepSize (current: LineSearchCoordinate, trial: LineSearchCoordinate): number {
  const x0 = current.stepSize
  const y0 = current.tower.value
  const m0 = current.tower.directionalDerivative

  const x1 = trial.stepSize
  const y1 = trial.tower.value
  const m1 = trial.tower.directionalDerivative

  const deltaX = x1 - x0

  const a = ((3 * m0 - m1) - 2 * (y1 - y0) / deltaX) / Math.pow(deltaX, 2)
  const b = ((m1 - 4 * m0) + 3 * (y1 - y0) / deltaX) / deltaX
  const c = m0
  const discriminantSqr = Math.pow(b, 2) - 3 * a * m0

  if (discriminantSqr < 0) return (x1 + x0) / 2
  if (discriminantSqr === 0) return x0 - c / (2 * b)
  return x0 + (-b - Math.sqrt(discriminantSqr)) / (3 * a)
}

/** Given a current approximation of the maximizer for the objective function, attempt to
 * find a step size to take in the direction of the ascent vector such that the
 * objective function increases and both the Arjio and Goldstein conditions are satisfied.
 * This algorithm is based on
 *
 * Dennis, J.E. and Schnabel, R.B. (1983) Numerical Methods for Unconstrained Optimization and Nonlinear Equations. Prentice-Hall, Englewoods Cliffs.
 *
 * with the following changes:
 * 1) it uses hermite cubic approximation rather than the cubic or quadratic approximation
 *    in the original algorithm.
 * 2) it contains additional optimizations which are possible because the Hessian matrix
 *    is negative definite and diagonal.
 *
 * @param engine - the inference engine containing the Bayesian network for which the
 *   parameters are being learned.
 * @param current - the tower of derivatives ar the current set of parameters.
 * @param numbersOfHeadLevels - The number of levels of each head variable in the
 *   bayes network.  This is used in estimating the maximum step size.
 * @param tolerance - the desired tolerance on the final parameters.
 * @param objectiveFn - the objective function being optimized.
 */
export function lineSearch (engine: InferenceEngine, current: TowerOfDerivatives, numbersOfHeadLevels: number[], tolerance: number, objectiveFn: ObjectiveFunction): StepResult {
  //= ============= CONSTANTS ====================================
  // the maximum step size allowed by the algorithm.   This is a first attempt at scaling the
  // step size based on the size of the network.   I am scaling it so that the max step size is a
  // multiple of the sum of the number of blocks in each conditional distribution
  const MAXSTEPSIZE = 0.5 * current.xs.reduce((acc, ps, i) => acc + ps.length / numbersOfHeadLevels[i], 0)
  const MAXLAMBDA = (current.ascentDirectionMagnitude > MAXSTEPSIZE) ? 1 : MAXSTEPSIZE / current.ascentDirectionMagnitude
  const MINLAMBDA = tolerance / relativeLength(current)
  const MAXITERATIONS = 100
  //= =============== UTILITY FUNCTIONS ==========================
  // A test for the Arjio-Goldstein value change condition.   This condition ensures that the
  // step size is not too large by requiring that the next apprixmation for the maximizer
  // causes the value of the objective function to decrease by at least a small amount
  const alphaCondition = (trial: TowerOfDerivatives, stepSize: number) => trial.value >= current.value + ALPHA * stepSize * current.directionalDerivative
  // A test for the Arjio-Goldstein gradient change condition.  This condition ensures that
  // the step size is not too small by requiring that the directional derivative measured
  // at the next approximation for the maximizer causes the slope to decrease by some small
  // amount.
  const betaCondition = (trial: TowerOfDerivatives) => BETA * current.directionalDerivative >= trial.directionalDerivative
  // Compute the next approximation for the maximizer of the objective function by taking
  // a step along the (quasi-)Newton ascent direction.
  const nextEstimate = (trial: TowerOfDerivatives, stepSize: number): LineSearchCoordinate => newtonStep(engine, current, stepSize, objectiveFn)

  //= =============== PRECONDITIONING ==========================
  // Clamp the ascent direction's magnitude so that it does not exceed the
  // maximum step size.
  if (current.ascentDirectionMagnitude > MAXSTEPSIZE) {
    current.ascentDirection = current.ascentDirection.map(ps => ps.map(p => MAXSTEPSIZE * p / current.ascentDirectionMagnitude))
    current.directionalDerivative = MAXSTEPSIZE * current.directionalDerivative / current.ascentDirectionMagnitude
    current.ascentDirectionMagnitude = MAXSTEPSIZE
  }

  //= =============== BACKTRACKING SEARCH ==========================
  // We begin the search with a full step in the quasi-newton direction.
  let iteration = 0
  let trial: LineSearchCoordinate = newtonStep(engine, current, 1, objectiveFn)
  let previous: LineSearchCoordinate | undefined
  do {
    if (alphaCondition(trial.tower, trial.stepSize)) {
      // ALPHA CONDITION IS TRUE
      if (betaCondition(trial.tower)) {
        // ALPHA AND BETA CONDITION ARE TRUE
        // If a step size has been found that satisfies the Arjio and Goldstein
        // conditions, then return the found step size and tower of derivatives
        // at the new set of parameters.
        restoreEngine(engine, trial.tower.xs, {})
        return { ...trial, status: StepStatus.STEP_TAKEN_TOWARD_MAXIMIZER }
      }
      // ALPHA CONDITION IS TRUE, BUT BETA IS NOT
      if (trial.stepSize === 1 && trial.tower.ascentDirectionMagnitude < MAXSTEPSIZE) {
        // If this is the first iteration and the step size can be increased, then
        // attempt to do so.
        do {
          const stepSize = Math.min(2 * trial.stepSize, MAXLAMBDA)
          previous = trial
          trial = nextEstimate(current, stepSize)
        } while (alphaCondition(trial.tower, trial.stepSize) && !betaCondition(trial.tower) && trial.stepSize < MAXLAMBDA)
        // Note: This may result in either both conditions being true, just alpha being true (when max step size is reached),
        // or neither condition being satisfied.
      }
      if (previous && (trial.stepSize < 1 || (trial.stepSize > 1 && !alphaCondition(trial.tower, trial.stepSize)))) {
        // if the step size has previously been modified, see if there is a better step size between the current
        // and trial step sizes.  This will have the effect of reducing the step size, which may cause the alpha
        // condition to become satisfied, or the beta condition to become unsatisfied.
        let [lo, hi]: LineSearchCoordinate[] = trial.stepSize > previous.stepSize
          ? [previous, trial] : [trial, previous]
        let better: LineSearchCoordinate = trial
        let diff: number = hi.stepSize - lo.stepSize
        while (diff >= MINLAMBDA || betaCondition(better.tower)) {
          better = nextEstimate(current, interpolateStepSize(lo, hi))
          if (alphaCondition(better.tower, better.stepSize)) {
            hi = better
          } else {
            lo = better
          }
          diff = hi.stepSize - lo.stepSize
        }
        if (betaCondition(better.tower)) {
          return { ...better, status: StepStatus.STEP_TAKEN_TOWARD_MAXIMIZER }
        } else {
          return { ...lo, status: StepStatus.STEP_TAKEN_TOWARD_MAXIMIZER }
        }
      }
    } else {
      if (trial.stepSize < MINLAMBDA) {
        // The trial is not sufficiently distinct from the current value.  We are done.
        return { tower: current, stepSize: 0, status: StepStatus.STEPSIZE_TOO_SMALL }
      }
      // The alpha condition is not satisfied.   Attempt to find a better step size
      // and trial maximizer by approximating the objective function as a hermite
      // cubic function of the step size, and interpolating the point at which the
      // derivative is zero.   Since the Hessian is negative definite, if such a point
      // exists, it is a better approximation for a maximizer.  To prevent too large
      // a change from the current step size, we clamp  this to the interval
      // 0.1 * current step size < approx < 0.5 * current step size.
      const approx = interpolateStepSize({ tower: current, stepSize: 0 }, trial)
      const stepSize = Math.max(0.1 * trial.stepSize, Math.min(0.5 * trial.stepSize, approx))
      trial = nextEstimate(current, stepSize)
    }
    previous = trial
    iteration++
  } while (iteration < MAXITERATIONS)
  return { ...trial, status: StepStatus.BACKTRACKING_STEPS_EXCEEDED }
}
