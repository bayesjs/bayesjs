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

const createFactorForClique = (network: INetwork, clique: IClique): string[] =>
  getNodesFromNetwork(network).reduce((acc, node) => {
    if (hasNodeIdAndParentsInClique(clique, node)) {
      return append(node.id, acc)
    }

    return acc
  }, [] as string[])

const createICliqueFactors = (cliques: IClique[], network: INetwork): ICliqueFactors =>
  reduce((acc, clique) => assoc(clique.id, createFactorForClique(network, clique), acc)
    , {}, cliques)

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

const getPotentialValueForNode = curry((combination: ICombinations, node: INode) => {
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

const createCliquePotential = curry((clique: IClique, network: INetwork, given: ICombinations, cliqueFactors: ICliqueFactors, combination: ICombinations): ICliquePotentialItem => ({
  when: combination,
  then: getPotentialValue(combination, network, given, cliqueFactors[clique.id]),
}))

const createCliquePotentials = (clique: IClique, network: INetwork, given: ICombinations, cliqueFactors: ICliqueFactors) => {
  const combinations = buildCombinations(network, clique.nodeIds)

  return map(createCliquePotential(clique, network, given, cliqueFactors), combinations)
}

export default (cliques: IClique[], network: INetwork, given: ICombinations): ICliquePotentials => {
  const cliqueFactors = createICliqueFactors(cliques, network)

  return reduce(
    (acc, clique) => assoc(clique.id, createCliquePotentials(clique, network, given, cliqueFactors), acc),
    {},
    cliques,
  )
}
