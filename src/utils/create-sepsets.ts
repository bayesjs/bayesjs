import { IClique, ISepSet } from '..'
import {
  addIndex,
  any,
  append,
  clone,
  converge,
  drop,
  equals,
  forEach,
  includes,
  length,
  pipe,
  prop,
  reduce,
  subtract,
} from 'ramda'

import { isNotEmpty } from './fp'
// this can be removed when ">= 11" and use the NodeJS sort method
import { sort } from 'timsort'

const forEachIndexed = addIndex<IClique>(forEach)
const sepSetNodesLength: (sepSet: ISepSet) => number = pipe(prop('sharedNodes'), length)

const getSharedNodes = (cliqueA: IClique, cliqueB: IClique) =>
  reduce(
    (acc, nodeId) => {
      if (includes(nodeId, cliqueB.nodeIds)) {
        return append(nodeId, acc)
      }

      return acc
    },
    [] as string[],
    cliqueA.nodeIds,
  )

const hasCycle = (cliques: IClique[], sepSets: ISepSet[]) => {
  const visited: { [key: string]: boolean } = {}

  const visit = (cliqueId: string, parentId?: string) => {
    visited[cliqueId] = true

    const adjacentCliqueIds = reduce(
      (acc, { ca, cb }) => {
        if (equals(cliqueId, cb)) return append(ca, acc)
        if (equals(cliqueId, ca)) return append(cb, acc)
        return acc
      },
      [] as string[],
      sepSets,
    )

    return any(
      adjacentCliqueId => {
        if (!visited[adjacentCliqueId]) {
          if (visit(adjacentCliqueId, cliqueId)) {
            return true
          }
        } else if (adjacentCliqueId !== parentId) {
          return true
        }

        return false
      },
      adjacentCliqueIds,
    )
  }

  return any(
    ({ id }) => !visited[id] && visit(id),
    cliques,
  )
}

const sortSepSets = (sepSets: ISepSet[]) => {
  const finalSepSets = clone(sepSets)

  sort(finalSepSets, converge(subtract, [sepSetNodesLength, sepSetNodesLength]))

  return finalSepSets
}

const removeCircularSepSets = (cliques: IClique[], sepSets: ISepSet[], onRemoveCircularSepset: (nodeIdA: string, nodeIdB: string) => void) =>
  reduce(
    (sepSets, sepSet) => {
      const newSepSets = append(sepSet, sepSets)

      if (hasCycle(cliques, newSepSets)) {
        onRemoveCircularSepset(sepSet.ca, sepSet.cb)
        return sepSets
      }

      return newSepSets
    },
    [] as ISepSet[],
    sortSepSets(sepSets),
  )

export const createSepSets = (cliques: IClique[], onRemoveEdge: (nodeIdA: string, nodeIdB: string) => void): ISepSet[] => {
  const sepSets: ISepSet[] = []

  forEachIndexed(
    (cliqueA, index) => {
      const rest = drop(index + 1, cliques)

      forEach(
        cliqueB => {
          const sharedNodes = getSharedNodes(cliqueA, cliqueB)

          if (isNotEmpty(sharedNodes)) {
            sepSets.push({ ca: cliqueA.id, cb: cliqueB.id, sharedNodes })
          }
        },
        rest,
      )
    },
    cliques,
  )

  return removeCircularSepSets(cliques, sepSets, onRemoveEdge)
}
