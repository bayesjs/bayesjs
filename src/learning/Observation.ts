import { InferenceEngine, FastPotential } from '..'
import { partition, equals } from 'ramda'
import { removeFirstVariable, adjustZeroPotentials } from '../engines/util'

export type PairedObservation = { [name: string]: string }

export type Evidence = { [name: string]: string[] }

export type GroupedEvidence = {
  evidence: Evidence;
  count: number;
  frequency: number;
}

/** Given a collection of paired observations and an inference engine
 * containing a Bayesian network, aggregate the observations and remove
 * any variables that do not occur in the given network.
 * @param data - a collection of paired observations
 * @param engine - an inference engine containing the Bayes network of
 *    interest.
 * NOTE: this function may throw an error if a level is observed for
 *   one of the variables which is not one of the possible levels
 *   of the variable in the Bayes Network.
 * */
export function groupDataByObservedValues (data: PairedObservation[], engine: InferenceEngine): GroupedEvidence[] {
  const throwErr = (reason: string) => { throw new Error(`Cannot update Bayes network. ${reason}`) }
  const result: GroupedEvidence[] = []
  let unvisited = [...data]
  do {
    const [searchTerm] = unvisited
    const [trues, falses] = partition(x => equals(x, searchTerm), unvisited)
    const group: GroupedEvidence = { frequency: trues.length / data.length, evidence: {}, count: trues.length }
    Object.entries(searchTerm).forEach(([k, v]) => {
      if (engine.hasVariable(k)) {
        if (engine.hasLevel(k, v)) {
          group.evidence[k] = [v]
        } else {
          throwErr(`A value of ${v} was provided for ${k}, which is not one of its levels.`)
        }
      }
    })
    result.push(group)
    unvisited = falses
  } while (unvisited.length > 0)
  return result
}

export type SampleBasedAverages = { joint: FastPotential; parents: FastPotential }

/** Compute the sample based average estimate of P(x,y|D),  that is the joint
 * distribution over the head and parent variables of each conditional distribution
 * given the evidence provided by the dataset.
 * @param engine - the inference engine containing the Bayes network of interest
 * @param groups - the aggregated dataset
 */
export function sampleBasedAverages (engine: InferenceEngine, groups: GroupedEvidence[]): SampleBasedAverages[] {
  const names = engine.getVariables()
  const numbersOfHeadLevels = names.map(name => engine.getLevels(name).length)
  const heads = groups.reduce((acc: FastPotential[], { evidence, frequency }) => {
    engine.setEvidence(evidence)
    const potentials = names.map(name => engine.getDistribution(name).getPotentials()) as FastPotential[]
    const weightedPotentials = potentials.map((ps: FastPotential) => ps.map(p => p * frequency))
    if (acc.length === 0) return weightedPotentials
    return acc.map((ps, i) => ps.map((p, j) => p + weightedPotentials[i][j]))
  }, [])
  return heads.map((joint, i) => {
    const xs: FastPotential = adjustZeroPotentials(joint, numbersOfHeadLevels[i])
    const ps: FastPotential = removeFirstVariable(xs, numbersOfHeadLevels[i])
    return {
      joint: xs,
      parents: ps,
    }
  })
}
