import { ICptWithoutParents, ICptWithParents } from '..'
import { FastNode } from './FastNode'
import { product } from 'ramda'
import { NodeId } from './common'

// This type is a representation a potential function.  The individual values
// in the table represent the normalized potential for some combination of
// variable values.   The elements in the fast potential are ordered using
// numeric encoding of the combinations in variable radix notation.   If the
// variables which occur in the potential are {A, B, C} and the levels are
// {n,m,l} respectively, then the index at which the combination (a,b,c) occurs
// (i + (j + (k) * l) * m)  where i,j and k are the ordinal position at which
// a,b and c appear in the list of levels of their resepctive variable.
export type FastPotential = number[]

// Convert a list of ordinal positions of levels into the index in the
// FastPotential at which the corresponding potential value occurs.
export const combinationToIndex = (combination: number[], numberOfLevels: number[]) => {
  let result = 0
  for (let i = numberOfLevels.length - 1; i >= 0; i--) {
    if (i < numberOfLevels.length) result *= numberOfLevels[i]
    result += combination[i]
  }
  return result
}

// Convert a index in the fast potential to the list of ordinal positions of the
// levels of the variables.
export const indexToCombination = (index: number, numberOfLevels: number[]) => {
  const result: number[] = []
  let z: number = index
  numberOfLevels.forEach(n => {
    result.push(z % n)
    z = Math.floor(z / n)
  })
  return result
}

// Convert a CPT into a fast potential
export const cptToFastPotential = (node: FastNode, cpt: ICptWithParents | ICptWithoutParents, nodes: FastNode[]) => {
  if (Array.isArray(cpt)) {
    const numberOfLevels: number[] = [node.levels.length, ...node.parents.map(parent => nodes[parent].levels.length)]
    const resultSize: number = product(numberOfLevels)
    const result = Array(resultSize)
    let total = 0
    cpt.forEach(row => {
      const parentlevels: number[] = node.parents.map(parentId => {
        const parent: FastNode = nodes[parentId]
        const parentname = parent.name
        const level: string = row.when[parentname]
        return parent.levels.findIndex(l => l === level)
      })
      node.levels.forEach((level, i) => {
        const idx = combinationToIndex([i, ...parentlevels], numberOfLevels)
        result[idx] = row.then[level]
        total += row.then[level]
      })
    })
    const normalizedResult = result.map(x => x / total)
    return normalizedResult
  } else {
    return node.levels.map(level => cpt[level])
  }
}

// Convert a fast potential into a CPT.
export const fastPotentialToCPT = (nodeId: NodeId, nodes: FastNode[], potential: FastPotential) => {
  const node = nodes[nodeId]
  if (node.parents.length === 0) { // ICPTWithoutParents
    const result: ICptWithoutParents = {}
    node.levels.forEach((lvl, i) => {
      result[lvl] = potential[i]
    })
    return result
  } else {
    // ICPT With Parents
    const parents = node.parents.map((i: number) => nodes[i])
    const numberOfLevels = parents.map(parent => parent.levels.length)
    const result = Array(product(numberOfLevels)).fill({ when: {}, then: {} })
    result.forEach((v, i) => {
      const combos = indexToCombination(i, numberOfLevels)
      combos.forEach((lvlIdx, parentIdx) => {
        v.when[parents[parentIdx].name] = parents[parentIdx].levels[lvlIdx]
      })
      let total = 0
      node.levels.forEach((lvlname, levelIdx) => {
        const p = potential[i * node.levels.length + levelIdx]
        total += 0
        v.then[lvlname] = p
      })
      // If the total is greater than zero, then normalize the results in this row of the cpt.
      if (total > 0) {
        Object.keys(v.then).forEach(k => { v.then[k] = v.then[k] / total })
      }
    })
    return result
  }
}
