import { FastPotential, InferenceEngine } from '../..'
import { parentIndex, adjustZeroPotentials, removeFirstVariable } from '../../engines/util'
import { GroupedEvidence } from '../Observation'

/** Compute the chi squared distance metric between a new best estimate of the
 * cpt entries and the original set of cpt entries.
 *
 * @param currentBest: The CPT entries for the current best estimate for
 *    optimizer of the objective function
 * @param priors: The CPT entries for the original distributions.
 * @param parents: The sample based joint probability distribution over
 *   the parents.
 */
export function chiSqrDistance (prior: FastPotential, currentBest: FastPotential, parentPotentials: FastPotential, numberOfHeadLevels: number): number {
  return prior.reduce((acc, q, i) => {
    const p = currentBest[i]
    const pa = parentPotentials[parentIndex(i, numberOfHeadLevels)]
    return acc + pa * Math.pow(p - q, 2) / q
  }, 0)
}

/** Given an inference engine and a collection of grouped observations,
 * compute the estimated log likelihood of the priors given the data.
 */
export function logLikelihood (engine: InferenceEngine, groups: GroupedEvidence[]): number {
  return groups.reduce((acc: number, group) => {
    const p = engine.infer(group.evidence)
    // if the probability is negative (as can occur when the step size
    // is too large)  we want to penalize the objective function.
    // We make the liklihood equal to machine epsilon in this case.
    const e = group.frequency * Math.log(p < 0 ? Number.EPSILON : p)
    return acc + e
  }
  , 0)
}

/** Given the name of a variable and the inference engine for a Bayesian
 * network in which the variable occurs, compute the local distribution
 * for the variable.   If the variable has no parents, this will be
 * the marginal distribution for the variable after message passing has
 * made the engine consistent.   When the variable has parents, it will
 * be approximately equal to the conditional distribution for that
 * variable after message passing.   In order to allow for learning, we
 * assume that any zero values are actually are approximately machine
 * epsilon.
 * @param name - The name of the variable for which the local
 *   distribution is requested
 * @param engine - the inference engine for a Bayes Network in which the
 *   variable occurs
 */
export function localDistributionPotentials (name: string, engine: InferenceEngine) {
  // Request the local distribution from the engine.  The potentials of the
  // local distribution are stored as the joint over the head and
  // parent variables, but because they are consistent, we can use these
  // to reconstruct the conditional distribution.
  const dist = engine.getDistribution(name)
  const numberOfHeadLevels = dist.getHeadVariable(name).levels.length
  const joint = dist.getPotentials()

  if (numberOfHeadLevels === joint.length) {
    // The variable has no parents.   We can return the joint distribution
    // because the potentials are the same as the potentials of the
    // conditional distribution.
    return adjustZeroPotentials(joint, numberOfHeadLevels)
  } else {
    // the distribution has one or more parent variables.   We need to
    // remove the contribution of the joint marginal over the parents from
    // the potentials.   P(x|y) = P(x,y)/P(y)
    const numberOfParentConfigurations = Math.floor(joint.length / numberOfHeadLevels)
    const parentMarginal = adjustZeroPotentials(removeFirstVariable(joint, numberOfHeadLevels), numberOfParentConfigurations)
    const local = joint.map((p, i) => p / parentMarginal[parentIndex(i, numberOfHeadLevels)])
    return adjustZeroPotentials(local, numberOfHeadLevels)
  }
}
