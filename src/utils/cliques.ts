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
  assoc,
  curry,
  divide,
  equals,
  filter,
  head,
  identity,
  ifElse,
  intersection,
  isNil,
  keys,
  length,
  map,
  mapObjIndexed,
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

      return isNil(nodeValue) || whenValue === nodeValue
    },
    keys(when),
  )
})

export const filterCliquePotentialsByNodeCombinations = (potentials: ICliquePotentialItem[], nodes: ICombinations): ICliquePotentialItem[] =>
  filter(
    checkPotentialByNodes(nodes),
    potentials,
  )

export const normalizeCliquePotentials = (cliquesPotentials: ICliquePotentials) =>
  mapObjIndexed(
    (potentials) =>
      map(
        potential => assoc('then', divide(potential.then, sumCliquePotentials(potentials)), potential),
        potentials,
      ),
    cliquesPotentials,
  )
