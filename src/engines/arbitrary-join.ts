import { FastPotential } from './FastPotential'
import { FastClique } from './FastClique'
import { Formula } from './Formula'
import { uniq, product, union, intersection } from 'ramda'
import { evaluateMarginalPure, evaluate, evaluateProductPure } from './evaluation'
import { FastNode } from './FastNode'
import { FormulaId } from './common'

// find a minimum set of nodes in the junction tree that covers all the variables of the
// joint distribution.  if S is the collection of varibles in the join, we do this by
// successivly pruning any leaf nodes A that are connected to a B for which the selection
// set (A intersect B) contains all the variables of A that are in S.
function minimumSpanningTree (cliques: FastClique[], separators: number[][], variables: number[]): { cliques: number[]; separators: number[]} {
  type TreeNode = { id: number; domain: number[]; neighbors: number[]}
  const leavesOfSpanningTree: (TreeNode | null)[] = cliques.map((c, i) => ({
    id: i,
    domain: [...c.domain],
    neighbors: [...c.neighbors],
  }))
  const nodeQueue = leavesOfSpanningTree.filter(c => c && c.neighbors.length === 1)

  while (nodeQueue.length > 0) {
    const node: TreeNode = nodeQueue.pop() as TreeNode
    const neighbor = leavesOfSpanningTree[node.neighbors[0]] as TreeNode
    const diff = node.domain.filter(x => variables.includes(x))
    if (diff.length === 0 || (neighbor && diff.every(x => neighbor.domain.includes(x)))) {
      // The node can be removed from the tree.
      leavesOfSpanningTree[node.id] = null
      neighbor.neighbors = neighbor.neighbors.filter(x => x !== node.id)
      if (neighbor.neighbors.length === 1) nodeQueue.push(neighbor)
    }
  }
  const cs: number[] = leavesOfSpanningTree.filter(x => x != null).map(x => x?.id) as number[]
  const ss: number[] = []
  cs.forEach(i => {
    const c = cliques[i]
    c.neighbors.forEach((j, idx) => {
      if (cs.includes(j)) ss.push(c.separators[idx])
    })
  })
  return {
    cliques: cs,
    separators: ss,
  }
}

export function arbitraryJoin (nodes: FastNode[], cliques: FastClique[], separators: number[][], separatorPotentials: FormulaId[], formulas: Formula[], potentialFunctions: (FastPotential|null)[], headVariables: number[], parentVariables: number[]): FastPotential {
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
  // BEGIN ALGORITHM

  const resultDomain = headVariables.concat(parentVariables)
  const resultNumberOfLevels = resultDomain.map(i => nodes[i].levels.length)
  const spanningTree = minimumSpanningTree(cliques, separators, resultDomain)

  spanningTree.cliques.forEach(i => evaluate(cliques[i].posterior, nodes, formulas, potentialFunctions))

  if (spanningTree.cliques.length < 1) throwErr('The minimum spanning tree did not have any nodes')
  const cliqueIds = spanningTree.cliques
  const [clique0, ...others]: FastClique[] = cliqueIds.map(i => cliques[i])

  let intermediateResultDomain: number[] = formulas[clique0.posterior].domain
  let intermediateResultNumberOfLevels: number[] = formulas[clique0.posterior].domain.map(i => nodes[i].levels.length)
  let intermediateResult: FastPotential = potentialFunctions[clique0.posterior] as FastPotential
  let unvisited = others
  const separatorVariables: number[] = spanningTree.separators.reduce((acc: number[], sep) => union(acc, separators[sep]), []).filter(i => !resultDomain.includes(i))

  const getNumberOfLevels = (domain: number[]) => domain.map(i => nodes[i].levels.length)
  do {
    if (unvisited.length === 0) break
    // pick a variable to eliminate
    const remainingVariables: number[] = unvisited.reduce((acc: number[], node) => union(acc, node.domain.filter(i => separatorVariables.includes(i))), [])
    const X: number[] = resultDomain.concat(remainingVariables)
    const variablesToRemove = intermediateResultDomain.filter(i => remainingVariables.includes(i))
    const queue = variablesToRemove.length === 0 ? unvisited : unvisited.filter(node => node.domain.includes(variablesToRemove[0]))
    unvisited = variablesToRemove.length === 0 ? [] : unvisited.filter(node => !node.domain.includes(variablesToRemove[0]))
    // Marginalize the intermediate result to remove any results not in X
    const nextIntermediateResultDomain = intermediateResultDomain.filter(i => X.includes(i))
    const nextIntermeidateResultNumberOfLevels = getNumberOfLevels(nextIntermediateResultDomain)
    intermediateResult = evaluateMarginalPure(intermediateResult, intermediateResultDomain, intermediateResultNumberOfLevels, nextIntermediateResultDomain, nextIntermeidateResultNumberOfLevels, product(nextIntermeidateResultNumberOfLevels))
    intermediateResultDomain = nextIntermediateResultDomain
    intermediateResultNumberOfLevels = nextIntermeidateResultNumberOfLevels
    queue.forEach(node => {
      const sepSet = intersection(node.domain, intermediateResultDomain)
      if (sepSet.length === node.domain.length) return // no new information contained in clique potential.  it can be skipped.
      // Marginalize the potential for the node to remove any variables not in X
      const marginalDomain = formulas[node.posterior].domain.filter(i => X.includes(i))
      const marginalNumberOfLevels = getNumberOfLevels(marginalDomain)
      const marginalizedPotential = evaluateMarginalPure(potentialFunctions[node.posterior] as FastPotential, formulas[node.posterior].domain, getNumberOfLevels(formulas[node.posterior].domain), marginalDomain, marginalNumberOfLevels, product(marginalNumberOfLevels))
      // Convert the potential function for the node to one that is conditioned on the separation set
      const sepSetNumberOfLevels = getNumberOfLevels(sepSet)
      const sepSetPotential = evaluateMarginalPure(marginalizedPotential, marginalDomain, marginalNumberOfLevels, sepSet, sepSetNumberOfLevels, product(sepSetNumberOfLevels))
      // Fuse the potential function for the node and the intermediate result.
      const productDomain = union(intermediateResultDomain, marginalDomain)
      const productNumberOfLevels = getNumberOfLevels(productDomain)
      intermediateResult = evaluateProductPure(
        [intermediateResult, marginalizedPotential, sepSetPotential.map(p => 1 / p)],
        [intermediateResultDomain, marginalDomain, sepSet],
        [intermediateResultNumberOfLevels, marginalNumberOfLevels, sepSetNumberOfLevels],
        productDomain,
        productNumberOfLevels,
        product(productNumberOfLevels))

      intermediateResultDomain = productDomain
      intermediateResultNumberOfLevels = productNumberOfLevels
    })
  } while (unvisited.length > 0)
  return evaluateMarginalPure(intermediateResult, intermediateResultDomain, intermediateResultNumberOfLevels, resultDomain, resultNumberOfLevels, product(resultNumberOfLevels))
}
