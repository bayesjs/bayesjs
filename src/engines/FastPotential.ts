import { ICptWithoutParents, ICptWithParents } from '..'
import { FastNode } from './FastNode'
import { product } from 'ramda'
import { NodeId } from './common'

export type FastPotential = number[]

export const combinationToIndex = (combination: number[], numberOfLevels: number[]) => {
  let result = 0
  for (let i = numberOfLevels.length - 1; i >= 0; i--) {
    if (i < numberOfLevels.length) result *= numberOfLevels[i]
    result += combination[i]
  }
  return result
}

export const indexToCombination = (index: number, numberOfLevels: number[]) => {
  const result: number[] = []
  let z: number = index
  numberOfLevels.forEach(n => {
    result.push(z % n)
    z = Math.floor(z / n)
  })
  return result
}

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
      node.levels.forEach((lvlname, levelIdx) => {
        const p = potential[i * node.levels.length + levelIdx]
        v.then[lvlname] = p
      })
    })
    return result
  }
}
