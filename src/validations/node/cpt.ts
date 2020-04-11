import { ICombinations, ICptWithParents, ICptWithoutParents, INetwork, INode } from '../../types'
import { buildCombinations, isNotNumber, isNotObject } from '../../utils'
import { equals, forEach, isNil, none, pluck, toString } from 'ramda'

const mapThen = pluck('when')

const checkIfAllProbabilitiesArePresent = (id: string, states: string[], probabilities: ICptWithoutParents) => {
  forEach(state => {
    if (isNil(probabilities[state])) {
      throw new Error(`[Node "${id}"]: Missing probability for "${state}" state.\n\nCurrent cpt: ${toString(probabilities)}`)
    }

    if (isNotNumber(probabilities[state])) {
      throw new Error(`[Node "${id}"]: All probabilities must be a number.\n\nProbability value for "${state}": ${toString(probabilities[state])}\nCurrent cpt: ${toString(probabilities)}`)
    }
  }, states)
}

const checkInvalidCombinations = (nodeId: string, nodeCombinations: ICombinations[], validCombinations: ICombinations[]) =>
  forEach(
    nodeCombination => {
      const notExist = none(equals(nodeCombination), validCombinations)

      if (notExist) {
        console.warn(`[Node "${nodeId}"]: The node cpt has one extra/invalid combination.\n\nInvalid combination: ${toString(nodeCombination)}\nAll node combinations: ${toString(nodeCombinations)}\nAll combinations needed: ${toString(validCombinations)}`)
      }
    },
    nodeCombinations,
  )

const checkMissingCombinations = (nodeId: string, nodeCombinations: ICombinations[], validCombinations: ICombinations[]) =>
  forEach(
    combination => {
      const notExist = none(equals(combination), nodeCombinations)

      if (notExist) {
        throw new Error(`[Node "${nodeId}"]: The node cpt has one missing combination.\n\nMissing combination: ${toString(combination)}\nAll node combinations: ${toString(nodeCombinations)}\nAll combinations needed: ${toString(validCombinations)}`)
      }
    },
    validCombinations,
  )

const validCombinations = (node: INode, network: INetwork) => {
  const combinations = buildCombinations(network, node.parents)
  const nodeCombinations = mapThen(node.cpt as ICptWithParents)

  checkMissingCombinations(node.id, nodeCombinations, combinations)
  checkInvalidCombinations(node.id, nodeCombinations, combinations)
}

export default (node: INode, network: INetwork) => {
  if (isNil(node.cpt)) {
    throw new Error(`[Node "${node.id}"]: The node cpt is required and must be an object or an array.\n\nNode: ${toString(node)}`)
  }

  if (isNotObject(node.cpt)) {
    throw new Error(`[Node "${node.id}"]: The node cpt must be an object or an array.\n\nCurrent cpt: ${toString(node.cpt)}`)
  }

  if (Array.isArray(node.cpt)) {
    validCombinations(node, network)

    forEach(probabilities => {
      checkIfAllProbabilitiesArePresent(node.id, node.states, probabilities.then)
    }, node.cpt)
  } else {
    checkIfAllProbabilitiesArePresent(node.id, node.states, node.cpt)
  }
}
