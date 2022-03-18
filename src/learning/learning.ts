import { InferenceEngine } from '..'
import { restoreEngine } from '../engines/util'
import { FastPotential } from '../engines/FastPotential'
import { PairedObservation, groupDataByObservedValues } from './Observation'
import { TowerOfDerivatives } from './TowerOfDerivatives'
import { StepStatus, statusMessage } from './StepResult'
import { newtonStep } from './newton-step'
import { localDistributionPotentials } from './objective-functions/util'
import { objectiveFunction } from './objective-functions/online-learning-objective-function'
import { SQRTEPS, CUBEROOTEPS } from './vector-utils'
import { lineSearch } from './line-search'

/** Compute a relative gradient that can be used for detecting if
 * the initial parameters are a maximizer for the objective function.
 * @param current - the current (intial) tower of derivatives
 * For a measure of the relative gradient, we take the maximum reltaive change in
 * f with respect to the relative change in a parameter.   This is scaled
 * to avoid excessively small values in the objective function, gradient or
 * parameters.
 */
function relativeGradient (current: TowerOfDerivatives): number {
  // The relative gradient is the maximum element of the projection of the
  // gradient onto the parameter vector onto the ascent direction.  To guard
  // against small values of the ascent direction, we clamp the minimum value
  // to the square root of epsilon.
  const numerator = current.gradient.reduce((acc, gs, i) =>
    Math.max(acc, gs.reduce((acc2, g, jk) => {
      const representativeX = Math.max(SQRTEPS, Math.abs(current.xs[i][jk]))
      return Math.abs(g * representativeX)
    }, 0)), 0)
  // However the relative gradient can still be effected by the scale of the
  // objective function.   To fix this, we divide by the greater the current value
  // of the objective function or a representative value.   For the representative
  // value we use half of the worst possible value for the log likelihood function.
  const denominator = Math.max(Math.abs(current.value), 0.5 * Math.abs(Math.log(SQRTEPS)))
  return numerator / denominator
}

/** Compute a relative change in the parameters that can be used for detecting if
 * the maximizer for the objective function has been found.
 * @param current - the current (intial) tower of derivatives
 * @param trial - a new set of parameters identified by either a Newton or quasi-
 *   Newton step.
 * For a measure of the relative change, we take the maximum relative change in
 * parameters between the current and trial values.   This is scaled
 * to avoid excessively small values.
 */
function relativeChange (current: TowerOfDerivatives, trial: TowerOfDerivatives): number {
  return current.xs.reduce((accI, ps, i) =>
    Math.max(accI, ps.reduce((accJK, p, jk) => Math.max(accJK,
      Math.abs(p - trial.xs[i][jk]) / Math.max(Math.abs(p), SQRTEPS),
    ), 0),
    ), 0)
}

/** Given a collection of paired observations and a Bayesian network with possibly informed
 * prior distributions, update the posterior distributions such that it balances the
 * objectives of fitting the observed data and respecting the prior values.
* @param engine: The inference engine for the Bayesian network.   The network must have at least
 *   one variable, and every variable must have at least one level.  This precondition is checked
 *   by the function, which will throw an error if the condition is not met.
 * @param data: A collection of paired observations of the variables in the distribution.  Any
 *   observation for a variable in the network must be for one of the levels of that variable.
 *   This precondition is checked by the function, which will throw an error if the condition is
 *   not met.   Observations for variables that do not occur in the network are ignored.
 * @param learningRate:  This optional argument controls the initial step
 *   size that the line search method will use.  Conceptually, it represents the weighting that is
 *   applied to the prior and data average values when computing a new estimate for the cpt values.
 *   When this value is 1, then both are weighted equally.
 * @param maxIterations: This optional argument controls the maximum
 *   number of steps that the algorithm is allowed to take before giving up.  Changing
 *   this value may be necessary when the provided data set is very small or very sparse.
 * @param tolerance: This optional argument specifies the target tolerance which
 *   must be satisfied in order for the algorithm to terminate.
 *
 * @returns An object containing the status of the optimization.  The "converged" field of this
 *   object can be checked by the calling function to tell if the algorithm reached the optimal
 *   assignment within the given tolerance and number of iterations.
 *
 * NOTE: Although convergence is guaranteed, the resulting assignments may not be globally
 *   optimal.   It may be necessary to use additional heuristics (e.g. tabu search) to
 *   find globally optimal assignments.
 */
export function learnParameters (engine: InferenceEngine, data: PairedObservation[], learningRate: number, maxIterations: number, tolerance: number) {
  // Perform some sanity checks on the data and parameters before we start
  // mutating the inference engine.
  const throwErr = (reason: string) => { throw new Error(`Cannot update Bayes network. ${reason}`) }
  if (data.length === 0) throwErr('no paired observations were provided')
  if (data.some((x: Record<string, string>) => Object.keys(x).length === 0)) throwErr('Dataset contains vacuous observations')
  if (learningRate <= 0 || learningRate >= 2) throwErr('The learning rate must be between 0 and 2')
  if (maxIterations < 0) throwErr('The maximum iterations must be positive')
  if (tolerance < Number.EPSILON || tolerance > 1) throwErr('The tolerance must be between 0 and 1.')

  const variableNames = engine.getVariables()
  const numbersOfHeadLevels: number[] = variableNames.map(name => engine.getLevels(name).length)

  // Cache the initial state of the inference engine.   We cache the initial
  // evidence so that it can be restored at the end of the learning episode.
  // We cache the local distributions so that we can roll them back in the
  // event of a failure to converge.
  const initialEvidence = engine.getAllEvidence()
  const cachedPriors = engine.toJSON()._potentials.slice(0, variableNames.length) as FastPotential[]
  const initialPriors = variableNames.map(name => localDistributionPotentials(name, engine))
  const groupedData = groupDataByObservedValues(data, engine)
  const objectiveFn = objectiveFunction(groupedData, initialPriors, learningRate)

  // This helper function is used to construct the return result with an
  // appropriate message.  As a side effect it restores the inference
  // engine to the specified parameter values.
  const makeResult = (steps: number, trial: TowerOfDerivatives, converged: boolean, message: string) => {
    restoreEngine(engine, trial.xs, {})
    return { steps, converged, value: trial.value, directionalDerivative: trial.directionalDerivative, parameters: trial.xs, message }
  }

  let current = objectiveFn(engine)

  // Is the initial state a maximizer for the objective function?  If so, then
  // exit.
  if (relativeGradient(current) < 0.001 * CUBEROOTEPS) {
    restoreEngine(engine, cachedPriors, initialEvidence)
    return { steps: 0, converged: true, ...current, message: statusMessage(StepStatus.GRADIENT_TOO_SMALL) }
  }

  let iteration = 0
  do {
    // Attempt to find a better approximation of the maximizer for the
    // objective function by taking an appropriately sized step in the
    // ascent direction.  When the Hessian is ill conditioned, then
    // use a line search method to find the appropriate step size in
    // the quasi-Newton direction, otherwise take a full step in the
    // Newton direction.
    const trial = (current.conditionNumber > SQRTEPS)
      ? newtonStep(engine, current, 1, objectiveFn)
      : lineSearch(engine, current, numbersOfHeadLevels, tolerance, objectiveFn)
    // Check to see if some termination condition has been reached.   if it
    // has, then exit with an appropriate status message.
    if (trial.status === StepStatus.GRADIENT_TOO_SMALL) return makeResult(iteration, trial.tower, true, statusMessage(trial.status))
    if (trial.status === StepStatus.BACKTRACKING_STEPS_EXCEEDED) return makeResult(iteration, trial.tower, false, statusMessage(trial.status))
    if (relativeGradient(trial.tower) < CUBEROOTEPS) return makeResult(iteration, trial.tower, true, statusMessage(StepStatus.GRADIENT_TOO_SMALL))
    if (relativeChange(current, trial.tower) < tolerance) return makeResult(iteration, trial.tower, true, statusMessage(StepStatus.STEPSIZE_TOO_SMALL))
    // Otherwise, set up for the next iteration.
    current = trial.tower
    restoreEngine(engine, current.xs, {})
    iteration++
  } while (iteration < maxIterations)
  // If we reached this point, then the algorithm failed to find a maximizer for
  // the objective function.  Restore the inference engine to the original state
  // and return a "failure" result.
  restoreEngine(engine, cachedPriors, initialEvidence)
  return makeResult(iteration, current, false, statusMessage(StepStatus.STEPS_EXCEEDED))
}
