import {
  IClique,
  ICombinations,
  ICptWithParents,
  ICptWithoutParents,
  INetwork,
} from '../../types'
import {
  intersection,
  isEqual,
  multiply,
} from 'lodash'

import { buildCombinations } from '../../utils'

const getInitalValueMaker = (given: ICombinations) => {
  const givenKeys = Object.keys(given)

  return (comb: ICombinations) => {
    if (givenKeys.length) {
      const combKeys = Object.keys(comb)
      const inter = intersection(givenKeys, combKeys)

      if (combKeys.length) {
        const all = inter.every(gk => comb[gk] === given[gk])

        return all ? 1 : 0
      }
    }
    return 1
  }
}

export const initializePotentials = (cliques: IClique[], network: INetwork, given: ICombinations) => {
  const getInitalValue = getInitalValueMaker(given)

  for (const clique of cliques) {
    clique.factors = []
    clique.potentials = []
    clique.messagesReceived = new Map()
  }

  for (const nodeId of Object.keys(network)) {
    const node = network[nodeId]
    const nodes = node.parents.concat(node.id)

    for (const clique of cliques) {
      if (nodes.every(x => clique.nodeIds.some(y => x === y))) {
        clique.factors!.push(nodeId)
        // break?
      }
    }
  }

  for (const clique of cliques) {
    const combinations = buildCombinations(network, clique.nodeIds)

    for (const combination of combinations) {
      let value = getInitalValue(combination)

      if (value > 0) {
        for (const factorId of clique.factors!) {
          const factor = network[factorId]

          if (factor.parents.length > 0) {
            const when = network[factorId].parents
              .reduce((acc, x) => ({ ...acc, [x]: combination[x] }), {})

            const cptRow = (factor.cpt as ICptWithParents).find(x => isEqual(x.when, when))

            value = multiply(value, cptRow!.then[combination[factorId]])
          } else {
            value = multiply(value, (factor.cpt as ICptWithoutParents)[combination[factorId]])
          }
        }
      }

      clique.potentials!.push({
        when: combination,
        then: value,
      })
    }

    delete clique.factors
  }
}
