import { FastPotential, indexToCombination } from './FastPotential'
import { FastClique } from './FastClique'
import { Formula } from './Formula'
import { uniq, product, union, intersection, partition, sum } from 'ramda'
import { evaluateMarginalPure, evaluate, evaluateProductPure } from './evaluation'
import { FastNode } from './FastNode'

/** find a minimum set of nodes in the junction tree that covers all the variables of the
joint distribution.  if S is the collection of varibles in the join, we do this by
successivly pruning any leaf nodes A that are connected to a B for which the selection
set (A intersect B) contains all the variables of A that are in S.

@param cliqueDomains: The domains of all the cliques in the junction tree
@param cliqueNeighbors: The indexes of the neighbors of each cliques
@param variables: the variables in the arbitrary join

@returns: An object containing all the cliques in the spanning forest and the
  collection of variables that occur in separators between them.
*/

function minimumSpanningTree (cliqueDomains: number[][], cliqueNeighbors: number[][], variables: number[]): { cliques: number[]; separators: number[]} {
  type TreeNode = { id: number; domain: number[]; neighbors: number[]}
  const leavesOfSpanningTree: (TreeNode | null)[] = cliqueDomains.map((c, i) => ({
    id: i,
    domain: [...c],
    neighbors: [...cliqueNeighbors[i]],
  }))
  const nodeQueue = leavesOfSpanningTree.filter(c => c && c.neighbors.length === 1)
  while (nodeQueue.length > 0) {
    const node: TreeNode = nodeQueue.pop() as TreeNode
    const neighbor = leavesOfSpanningTree[node.neighbors[0]] as TreeNode
    const diff = node.domain.filter(x => variables.includes(x))
    // If the neighbor has all of the variables of interest that are in the current
    // node, then we can prune the current node.
    if (diff.length === 0 || (neighbor && diff.every(x => neighbor.domain.includes(x)))) {
      leavesOfSpanningTree[node.id] = null
      neighbor.neighbors = neighbor.neighbors.filter(x => x !== node.id)
      if (neighbor.neighbors.length === 1) nodeQueue.push(neighbor)
    }
  }
  const cs: number[] = leavesOfSpanningTree.filter(x => x != null).map(x => x?.id) as number[]
  let ss: number[] = []
  cs.forEach(cliqueIdx => {
    const c = cliqueNeighbors[cliqueIdx]
    c.forEach(neighborIdx => {
      if (cs.includes(neighborIdx)) ss = union(ss, intersection(cliqueDomains[cliqueIdx], cliqueDomains[neighborIdx]))
    })
  })
  return {
    cliques: cs,
    separators: ss,
  }
}

/** Construct the join of an arbitrary collection of variables in a Bayesian Network,
 * conditioned on an optional set of parent variables.
 * @param nodes: The collection of nodes in the bayesian network
 * @param cliques: The collection of cliques in the junction tree for the bayesian
 *   network.
 * @param formulas: The collection of formulas for computing the posterior
 *   distributions for the cliques, nodes and separators  of the Bayes Network, and
 *   all the intermediate potentials.
 * @param potentialFunction: The collection of potential functions for the cliques
 *   nodes and separators of the Bayes Network and the intermediate potentials.
 * @param headVariables: The indices of the variables that occur as head variables of
 *   the joint distribution being constructed.  These indices must be valid references
 *   to variables in the network.
 * @param parentVariables: The idices of the variables that occur as parent variables
 *   of the joint distribution being constructed.   These indices must be valid
 *   references for the variables in the network, and must be distinct from the
 *   head variables of the joint being constructed.
 * @returns: The potential function for the join which satisfies the conditions
 *   that for every combination of parents, the potentials sum to unity.  The
 *   case when there are no parents (unconditioned joint distribution), corresponds
 *   to the trivial case where there is only a single (empty) combination of
 *   parent values.
 */
function constructJoin (
  cliqueDomains: number[][],
  cliqueNeighbors: number[][],
  cliquePotentials: FastPotential[],
  separatorDomains: number[][],
  separatorPotentials: FastPotential[],
  numbersOfLevels: number[],
  resultDomain: number[],
) {
  // Compute the spanning forest for the variables in the join.  This is the minimum
  // set of cliques that contain one or more variables in the join and any cliques
  // that are on a path between them.   Although this case should not occur for a
  // well formed set of inputs, we guard agaist the case when the spanning tree is
  // empty.
  const spanningTree = minimumSpanningTree(cliqueDomains, cliqueNeighbors, resultDomain)
  const throwErr = (reason: string) => { throw new Error('Cannot compute the join over the given head and parent variables.  ' + reason) }
  if (spanningTree.cliques.length < 1) throwErr('The minimum spanning tree did not have any nodes')
  const cliqueIds = spanningTree.cliques
  const [clique0, ...others]: number[] = cliqueIds

  // Initialize the the accumulators for the innermediate result.   This will
  // contain the intermediate product of the cliques as they are visited by
  // the main loop.   Initially it contains the "root" clique.
  let intermediateResultDomain: number[] = cliqueDomains[clique0]
  let intermediateResultNumberOfLevels: number[] = intermediateResultDomain.map(i => numbersOfLevels[i])
  let intermediateResult: FastPotential = cliquePotentials[clique0] as FastPotential
  let unvisited: number[] = [...others]
  const separatorVariables: number[] = spanningTree.separators.filter(i => !resultDomain.includes(i))

  const getNumberOfLevels = (domain: number[]) => domain.map(i => numbersOfLevels[i])

  do {
    if (unvisited.length === 0) break
    // Find all the remaining variables that occur in both one of the unvisited cliques
    // as well as a separator variables.
    const remainingVariables: number[] = unvisited.reduce((acc: number[], cliqueId) => union(acc, cliqueDomains[cliqueId].filter(i => separatorVariables.includes(i))), [])
    const X: number[] = resultDomain.concat(remainingVariables)

    // Find all the possible variables that appear between the
    // current intermediate result and some other unvisited clique
    const variablesToRemove = intermediateResultDomain.filter(i => remainingVariables.includes(i))
    // If this list is empty, this means that the junction tree had more than one connected
    // component (e.g. it was a forest rather than a tree.   In that case, we can pick an
    // arbitrary node to queue up.   Otherwise, we pick only those that share the chosen variable
    // to remove. )
    const queue: number[] = []
    if (variablesToRemove.length === 0) {
      const nextClique = unvisited.pop() as number
      queue.push(nextClique)
    } else {
      const [ts, fs] = partition(cliqueId => cliqueDomains[cliqueId].includes(variablesToRemove[0]), unvisited)
      queue.push(...ts)
      unvisited = fs
    }
    // Marginalize the intermediate result to remove any results not in either the result
    // domain, or one of the separation sets between unvisited cliques.
    const nextIntermediateResultDomain = intermediateResultDomain.filter(i => X.includes(i))
    const nextIntermeidateResultNumberOfLevels = getNumberOfLevels(nextIntermediateResultDomain)
    intermediateResult = evaluateMarginalPure(intermediateResult, intermediateResultDomain, intermediateResultNumberOfLevels, nextIntermediateResultDomain, nextIntermeidateResultNumberOfLevels, product(nextIntermeidateResultNumberOfLevels), false)
    intermediateResultDomain = nextIntermediateResultDomain
    intermediateResultNumberOfLevels = nextIntermeidateResultNumberOfLevels
    // For each of the cliques in the queue, we need to join it with the intermediate result.
    // However, the joint distribution already has been made consistent, and therefore contains
    // the information regarding the any of the common variables.  In the case where the
    // factors of the join are independent (the case that the clique had multiple connected
    // components), we can compute the new intermediate using the relation:
    // P(X,Z) = P(X) * P(Z).   Otherwise, we need to factor out the common variables to
    // preserve consistency:
    // P(X,Y,Z) = P(X | Y ) * P(Y,Z) = P(X,Y) * P(Y,Z) / P(Y)
    // For added efficiency, we also handle the special case:
    // P(X,Y) * P(Y) = P(X,Y)
    queue.forEach(cliqueId => {
      const sepSet = intersection(cliqueDomains[cliqueId], intermediateResultDomain)
      if (sepSet.length === cliqueDomains[cliqueId].length) return // no new information contained in clique potential.  it can be skipped.
      if (sepSet.length !== 0) {
        // Marginalize the potential for the node to remove any variables not in X
        const marginalDomain = cliqueDomains[cliqueId].filter(i => X.includes(i))
        const marginalNumberOfLevels = getNumberOfLevels(marginalDomain)
        const marginalizedPotential = evaluateMarginalPure(cliquePotentials[cliqueId] as FastPotential, cliqueDomains[cliqueId], getNumberOfLevels(cliqueDomains[cliqueId]), marginalDomain, marginalNumberOfLevels, product(marginalNumberOfLevels), false)
        // Find the best smallest separator set that constiains the variables in the
        // separator set.
        let bestSeparatorPotentialID = -1
        separatorDomains.forEach((dom, domId) => {
          if (sepSet.every(i => dom.includes(i)) && (bestSeparatorPotentialID < 0 || separatorDomains[bestSeparatorPotentialID].length > dom.length)) bestSeparatorPotentialID = domId
        })
        if (bestSeparatorPotentialID < 0) throwErr('Could not find separator potential')
        // It is possible that the best separator set contains variables that are not in
        // the separator set between the intermediate result and the new clique being
        // joined.   The variables may also be in a different order than in the
        // separator set  to deal with this, we marginalize.
        const sepSetNumberOfLevels = getNumberOfLevels(sepSet)
        const sepSetPotential =
          evaluateMarginalPure(
            separatorPotentials[bestSeparatorPotentialID],
            separatorDomains[bestSeparatorPotentialID],
            getNumberOfLevels(separatorDomains[bestSeparatorPotentialID]), sepSet, sepSetNumberOfLevels, product(sepSetNumberOfLevels), false)
        // Fuse the potential function for the node and the intermediate result.
        const productDomain = union(intermediateResultDomain, marginalDomain)
        const productNumberOfLevels = getNumberOfLevels(productDomain)
        intermediateResult = evaluateProductPure(
          [intermediateResult, marginalizedPotential, sepSetPotential.map(p => 1 / p)],
          [intermediateResultDomain, marginalDomain, sepSet],
          [intermediateResultNumberOfLevels, marginalNumberOfLevels, sepSetNumberOfLevels],
          productDomain,
          productNumberOfLevels,
          product(productNumberOfLevels), false)
        intermediateResultDomain = productDomain
        intermediateResultNumberOfLevels = productNumberOfLevels
      } else {
        // Special case for junction forest.  P(X,Y) = P(X) * P(Y)
        // Fuse the potential function for the node and the intermediate result.
        const productDomain = union(intermediateResultDomain, cliqueDomains[cliqueId])
        const productNumberOfLevels = getNumberOfLevels(productDomain)
        intermediateResult = evaluateProductPure(
          [intermediateResult, cliquePotentials[cliqueId]],
          [intermediateResultDomain, cliqueDomains[cliqueId]],
          [intermediateResultNumberOfLevels, getNumberOfLevels(cliqueDomains[cliqueId])],
          productDomain,
          productNumberOfLevels,
          product(productNumberOfLevels),
          false,
        )

        intermediateResultDomain = productDomain
        intermediateResultNumberOfLevels = productNumberOfLevels
      }
    })
  } while (unvisited.length > 0)
  const resultNumberOfLevels = getNumberOfLevels(resultDomain)
  return evaluateMarginalPure(intermediateResult, intermediateResultDomain, intermediateResultNumberOfLevels, resultDomain, resultNumberOfLevels, product(resultNumberOfLevels), false)
}

/** Construct the join of an arbitrary collection of variables in a Bayesian Network,
 * conditioned on an optional set of parent variables.
 * @param nodes: The collection of nodes in the bayesian network
 * @param cliques: The collection of cliques in the junction tree for the bayesian
 *   network.
 * @param formulas: The collection of formulas for computing the posterior
 *   distributions for the cliques, nodes and separators  of the Bayes Network, and
 *   all the intermediate potentials.
 * @param potentialFunction: The collection of potential functions for the cliques
 *   nodes and separators of the Bayes Network and the intermediate potentials.
 * @param headVariables: The indices of the variables that occur as head variables of
 *   the joint distribution being constructed.  These indices must be valid references
 *   to variables in the network.
 * @param parentVariables: The idices of the variables that occur as parent variables
 *   of the joint distribution being constructed.   These indices must be valid
 *   references for the variables in the network, and must be distinct from the
 *   head variables of the joint being constructed.
 * @returns: The potential function for the join which satisfies the conditions
 *   that for every combination of parents, the potentials sum to unity.  The
 *   case when there are no parents (unconditioned joint distribution), corresponds
 *   to the trivial case where there is only a single (empty) combination of
 *   parent values.
 */
export function arbitraryJoin (nodes: FastNode[], cliques: FastClique[], formulas: Formula[], potentialFunctions: (FastPotential|null)[], separatorDomains: number[][], separatorPotentialIds: number[], headVariables: number[], parentVariables: number[]): FastPotential {
  const distinctHeadVariables = uniq(headVariables)
  const distinctParentVariables = uniq(parentVariables)

  // SANITY CHECKS HERE
  const throwErr = (reason: string) => { throw new Error('Cannot compute the join over the given head and parent variables.  ' + reason) }
  if (headVariables.length === 0) throwErr('No head variables were provided.')
  if (headVariables.length < distinctHeadVariables.length) throwErr('The head variables are not distinct.')
  if (parentVariables.length < distinctParentVariables.length) throwErr('The parent variables are not distinct.')
  if (distinctHeadVariables.some(x => distinctParentVariables.includes(x))) throwErr('The head and parent variables are not disjoint')
  if (distinctHeadVariables.some(x => x < 0 || x >= nodes.length)) throwErr('Some of the head variables do not exist in the network.')
  if (distinctParentVariables.some(x => x < 0 || x >= nodes.length)) throwErr('Some of the parent variables do not exist in the network.')

  // Evaluate all of the cliques and their separator potentials, and then construct the arguments
  // to pass to the constructJoin function.
  cliques.forEach(clique => {
    evaluate(clique.posterior, nodes, formulas, potentialFunctions)
  })
  separatorPotentialIds.forEach(id => {
    evaluate(id, nodes, formulas, potentialFunctions)
  })
  const separatorPotentials = separatorPotentialIds.map(id => potentialFunctions[id] as FastPotential)
  const resultDomain = headVariables.concat(parentVariables)
  const cliquePotentials: FastPotential[] = cliques.map(clique => potentialFunctions[clique.posterior] as FastPotential)
  const cliqueDomains: number[][] = cliques.map(clique => formulas[clique.posterior].domain)
  const cliqueNeighbors: number[][] = cliques.map(clique => clique.neighbors)
  const numbersOfLevels = nodes.map(node => node.levels.length)

  return constructJoin(cliqueDomains, cliqueNeighbors, cliquePotentials, separatorDomains, separatorPotentials, numbersOfLevels, resultDomain)
}

function removeContradictions (potential: FastPotential, domain: number[], numberOfLevels: number[], variables: number[], values: number[][]) {
  if (intersection(domain, variables).length === 0) return potential
  const domToVar: number[] = domain.map(i => variables.indexOf(i))
  return potential.filter((p, i) => {
    const combo = indexToCombination(i, numberOfLevels)
    return combo.every((l, vIdx) => {
      const v = domToVar[vIdx]
      return v === -1 || values[v].includes(l)
    })
  })
}

export function inferArbitraryJointProbability (nodes: FastNode[], cliques: FastClique[], formulas: Formula[], potentialFunctions: (FastPotential|null)[], separatorDomains: number[][], separatorPotentialIds: number[], variables: number[], values: number[][]): number {
  const distinctVariables = uniq(variables)

  // SANITY CHECKS HERE
  const throwErr = (reason: string) => { throw new Error('Cannot compute the join over the given head and parent variables.  ' + reason) }
  if (variables.length === 0) throwErr('No head variables were provided.')
  if (variables.length < distinctVariables.length) throwErr('The head variables are not distinct.')
  if (distinctVariables.some(x => x < 0 || x >= nodes.length)) throwErr('Some of the head variables do not exist in the network.')

  // Evaluate all of the cliques and their separator potentials, and then construct the arguments
  // to pass to the constructJoin function.
  const numbersOfLevels = nodes.map(node => node.levels.length)

  cliques.forEach(clique => {
    evaluate(clique.posterior, nodes, formulas, potentialFunctions)
  })
  separatorPotentialIds.forEach(id => {
    evaluate(id, nodes, formulas, potentialFunctions)
  })

  const cliquePotentials: FastPotential[] = cliques.map(clique => {
    const ps = potentialFunctions[clique.posterior] as FastPotential
    const formula = formulas[clique.posterior]
    const dom = formula.domain
    const qs = removeContradictions(ps, dom, dom.map(i => numbersOfLevels[i]), variables, values)
    return qs
  },
  )
  const separatorPotentials: FastPotential[] = separatorPotentialIds.map((id, j) => {
    const ps = potentialFunctions[id] as FastPotential
    const qs = removeContradictions(ps, separatorDomains[j], separatorDomains[j].map(i => numbersOfLevels[i]), variables, values)
    return qs
  },
  )

  const cliqueDomains: number[][] = cliques.map(clique => formulas[clique.posterior].domain)
  const cliqueNeighbors: number[][] = cliques.map(clique => clique.neighbors)
  const restrictedNumbersOfLevels = numbersOfLevels.map((n, i) => variables.includes(i) ? values[variables.indexOf(i)].length : n)

  const jointPotentials = constructJoin(cliqueDomains, cliqueNeighbors, cliquePotentials, separatorDomains, separatorPotentials, restrictedNumbersOfLevels, variables)
  return sum(jointPotentials)
}
