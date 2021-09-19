import {
  IClique,
  ICliquePotentialItem,
  ICliquePotentials,
  ICombinations,
  INode,
} from '../types'
import {
  all,
  always,
  curry,
  equals,
  filter,
  head,
  identity,
  ifElse,
  intersection,
  keys,
  length,
  minBy,
  pipe,
  pluck,
  prop,
  reduce,
  sum,
  tail,
  useWith,
} from 'ramda'
import { includesFlipped, isNotEmpty } from './fp'

import { getNodeParentsAndId } from './network'

const getCliqueNodeIds: (clique: IClique) => string[] = prop('nodeIds')
const defaultToOne: (value: number) => number = ifElse(equals(0), always(1), identity)
const getCliqueNodesLength: (clique: IClique) => number = pipe(getCliqueNodeIds, length)

export const mapPotentialsThen: (potentials: ICliquePotentialItem[]) => number[] = pluck('then')
export const sumCliquePotentials: (potentials: ICliquePotentialItem[]) => number = pipe(mapPotentialsThen, sum, defaultToOne)

export const hasNodeIdsInClique: (clique: IClique, nodeIds: string[]) => boolean = useWith(
  all,
  [pipe(prop('nodeIds'), includesFlipped), identity],
)

export const hasNodeIdAndParentsInClique: (clique: IClique, node: INode) => boolean = useWith(
  hasNodeIdsInClique,
  [identity, getNodeParentsAndId],
)

export const getCliqueWithLessNodes = (cliques: IClique[]): IClique => {
  const firstClique = head(cliques)

  if (firstClique) {
    return reduce(minBy(getCliqueNodesLength), firstClique, tail(cliques))
  }

  throw new Error('Cliques are empty')
}

export const filterCliquesByNodeCombinations = (cliques: IClique[], nodes: ICombinations = {}) => filter(
  pipe(
    prop('nodeIds'),
    intersection(keys(nodes)),
    isNotEmpty,
  ),
  cliques,
)

const checkPotentialByNodes = curry((nodes: ICombinations, potential: ICliquePotentialItem): boolean => {
  const { when } = potential

  return all(
    (nodeId) => {
      const whenValue = when[nodeId]
      const nodeValue = nodes[nodeId]

      return nodeValue == null || whenValue === nodeValue
    },
    keys(when),
  )
})

export const filterCliquePotentialsByNodeCombinations = (potentials: ICliquePotentialItem[], nodes: ICombinations): ICliquePotentialItem[] =>
  filter(
    checkPotentialByNodes(nodes),
    potentials,
  )

export const normalizeCliquePotential = (potentials: ICliquePotentialItem[]) => {
  const total = sumCliquePotentials(potentials)
  return potentials.map(potential => {
    potential.then = potential.then / total
    return potential
  },
  )
}

export const normalizeCliquePotentials = (cliquesPotentials: ICliquePotentials) => {
  for (const key of Object.keys(cliquesPotentials)) {
    cliquesPotentials[key] = normalizeCliquePotential(cliquesPotentials[key])
  }

  return cliquesPotentials
}
