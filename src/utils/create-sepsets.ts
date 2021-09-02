import { IClique, ISepSet } from '..'
import {
  addIndex,
  any,
  append,
  clone,
  drop,
  equals,
  forEach,
  reduce,
} from 'ramda'

import { isNotEmpty } from './fp'
// this can be removed when ">= 11" and use the NodeJS sort method
import { sort } from 'timsort'

const forEachIndexed = addIndex<IClique>(forEach)
const sepSetCompare: (a: ISepSet, b: ISepSet) => number = (a, b) =>
  b.sharedNodes.length - a.sharedNodes.length

// Find the shared nodes in two cliques (O(n log(n))).
const getSharedNodes = (cliqueA: IClique, cliqueB: IClique) => {
  const A = new Set(cliqueA.nodeIds)
  const B = new Set(cliqueB.nodeIds)
  const union = Array(...new Set([...cliqueA.nodeIds, ...cliqueB.nodeIds]))
  const result = union.filter(x => A.has(x) && B.has(x))
  return result
}

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

  sort(finalSepSets, sepSetCompare)

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
