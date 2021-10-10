import {
  IClique,
  ICliqueFactors,
  ICliquePotentialItem,
  ICliquePotentials,
  ICombinations,
  ICptWithParents,
  ICptWithoutParents,
  INetwork,
  INode,
} from '../../types'
import {
  append,
  assoc,
  curry,
  equals,
  find,
  map,
  multiply,
  pipe,
  prop,
  reduce,
} from 'ramda'
import {
  buildCombinations,
  getNodesFromNetwork,
  hasNodeIdAndParentsInClique,
  hasNodeParents,
  objectEqualsByIntersectionKeys,
} from '../../utils'

/** * Return a list of factors that care included in the given clique.   Each factor can
 * be assigned to exactly one clique, and that clique must include all of it's parents.
 */
const createFactorForClique = (network: INetwork, clique: IClique, visited: Set<string>): string[] =>
  getNodesFromNetwork(network).reduce((acc, node) => {
    if (hasNodeIdAndParentsInClique(clique, node) && !visited.has(node.id)) {
      visited.add(node.id)
      return append(node.id, acc)
    }
    return acc
  }, [] as string[])

/** Return an object that associates each clique with the factors which it contains.
 * Each factor can be assigned to exactly one clique, that that clique must include
 * all of it's parents.   Note that for some network topologies, this may result in
 * a choice for which clique to assign the factor
 *
 * Example, the network having the graph below:
 *
 *     A
 *   / | \
 *  V  V  V
 * B-->C<--D
 *
 * has two cliques: {A,B,C} and {A,C,D}.   The factors A and C can be assigned to either
 * clique, but not both.  To make inference easier, whenever possible we assign a factor to a clique
 * with the fewer number of nodes.
 * */
export const createICliqueFactors = (cliques: IClique[], network: INetwork): ICliqueFactors => {
  const visited: Set<string> = new Set()

  return reduce((acc, clique) => assoc(clique.id, createFactorForClique(network, clique, visited), acc)
    , {}, cliques.sort((a, b) => a.nodeIds.length - b.nodeIds.length))
}

const mergeParentsAndCombination = (node: INode, combination: ICombinations) => reduce((acc, nodeId) => assoc(nodeId, combination[nodeId], acc), {}, node.parents)

const getPotentialValueForNodeWithParents = (combination: ICombinations, node: INode) => {
  const cpt = (node.cpt as ICptWithParents)
  const when = mergeParentsAndCombination(node, combination)
  const cptRow = find(pipe(prop('when'), equals(when)), cpt)

  if (cptRow) {
    return cptRow.then[combination[node.id]]
  }

  throw new Error('Not found combination in node')
}

const getPotentialValueForNodeWithoutParents = (combination: ICombinations, node: INode) => {
  const cpt = (node.cpt as ICptWithoutParents)
  const combinationValue = combination[node.id]

  return cpt[combinationValue]
}

const getPotentialValueForNode: (combination: ICombinations) => (node: INode) => number =
  curry((combination: ICombinations, node: INode) => {
    if (hasNodeParents(node)) {
      return getPotentialValueForNodeWithParents(combination, node)
    }

    return getPotentialValueForNodeWithoutParents(combination, node)
  })

const getPotentialValueForNodeIds = (network: INetwork, combination: ICombinations, nodeIds: string[]) => {
  const nodes = map(item => network[item], nodeIds)
  const nodesPotentialValues = map(getPotentialValueForNode(combination), nodes)

  return reduce<number, number>(multiply, 1, nodesPotentialValues)
}

const getPotentialValue = (combination: ICombinations, network: INetwork, given: ICombinations, factors: string[]) => {
  if (objectEqualsByIntersectionKeys(given, combination)) {
    return getPotentialValueForNodeIds(network, combination, factors)
  }

  return 0
}

const createCliquePotential: (clique: IClique, network: INetwork, given: ICombinations, cliqueFactors: ICliqueFactors) => (combination: ICombinations) => ICliquePotentialItem =
  curry((clique: IClique, network: INetwork, given: ICombinations, cliqueFactors: ICliqueFactors, combination: ICombinations) => ({
    when: combination,
    then: getPotentialValue(combination, network, given, cliqueFactors[clique.id]),
  }))

const createCliquePotentials = (clique: IClique, network: INetwork, given: ICombinations, cliqueFactors: ICliqueFactors) => {
  const combinations = buildCombinations(network, clique.nodeIds)

  return map(createCliquePotential(clique, network, given, cliqueFactors), combinations)
}

export default (cliques: IClique[], network: INetwork, given: ICombinations): ICliquePotentials => {
  const cliqueFactors = createICliqueFactors(cliques, network)

  const cliquePotentials: ICliquePotentials = {}

  for (const clique of cliques) {
    const cliquePotential: ICliquePotentialItem[] = createCliquePotentials(clique, network, given, cliqueFactors)
    cliquePotentials[clique.id] = cliquePotential
  }

  return cliquePotentials
}
