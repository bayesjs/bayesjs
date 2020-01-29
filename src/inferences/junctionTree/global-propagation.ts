import {
  IClique,
  ICliquePotentialItem,
  ICombinations,
  IGraph,
  INetwork,
  ISepSet,
} from '../../types'
import { buildCombinations, flager } from '../../utils'
import {
  clone,
  divide,
  multiply,
  sum,
} from 'ramda'

const getSepSet = (sepSets: ISepSet[], id: string, neighborId: string) => {
  const temp = sepSets.find(x => (x.ca === neighborId && x.cb === id) || (x.ca === id && x.cb === neighborId))

  return temp!.sharedNodes.sort()
}

const createMessage = (combinations: ICombinations[], potentials: ICliquePotentialItem[], messageReceived?: ICliquePotentialItem[]): ICliquePotentialItem[] => {
  const initCombs = combinations.map(x => ({ when: x, then: 0 }))
  const message: ICliquePotentialItem[] = []

  for (const { when } of initCombs) {
    const keys = Object.keys(when)
    const potentialsThen = potentials
      .filter(potential => keys.every(key => when[key] === potential.when[key]))
      .map(x => x.then)
    const then = sum(potentialsThen)

    message.push({
      then,
      when: clone(when),
    })
  }

  if (messageReceived) {
    for (const row of message) {
      const { when, then } = row
      const whenKeys = Object.keys(when)
      const mr = messageReceived.find(mr => whenKeys.every(wk => mr.when[wk] === when[wk]))
      const value = divide(then, (mr!.then || 1))

      row.then = value
    }
  }

  return message
}

const absorvMessage = (clique: IClique, message: ICliquePotentialItem[]) => {
  if (message.length) {
    const keys = Object.keys(message[0].when)

    for (const row of message) {
      clique.potentials!
        .filter(potential => keys.every(x => row.when[x] === potential.when[x]))
        .forEach(potential => {
          potential.then = multiply(potential.then, row.then)
        })
    }
  }
}

const bestRootIndex = () => 0

export const globalPropagation = (network: INetwork, junctionTree: IGraph, cliques: IClique[], sepSets: ISepSet[]) => {
  const { isMarked, mark, unmark, unmarkAll } = flager()
  const nonParentNodes = Object.keys(network)
    .map(nodeId => network[nodeId])
    .filter(({ parents }) => parents.length === 0)
    .map(({ id }) => id)

  const collectEvidence = (id: string, parentId?: string) => {
    mark(id)

    const neighbors = junctionTree.getNeighborsOf(id)
      .filter(x => !isMarked(x))

    for (const neighbor of neighbors) {
      collectEvidence(neighbor, id)
    }

    if (parentId) {
      const clique = cliques.find(x => x.id === id)!
      const sepSet = getSepSet(sepSets, id, parentId).filter(x => nonParentNodes.indexOf(x) === -1)
      const { potentials } = clique
      const combinations = buildCombinations(network, sepSet)
      const message = createMessage(combinations, potentials!)
      const parent = cliques.find(x => x.id === parentId)!

      parent.messagesReceived!.set(clique.id, message)
      absorvMessage(parent, message)
    }

    unmark(id)
  }

  const distributeEvidence = (id: string) => {
    mark(id)

    const clique = cliques.find(x => x.id === id)!
    const { messagesReceived, potentials } = clique

    const neighbors = junctionTree.getNeighborsOf(id)
      .filter(x => !isMarked(x))

    for (const neighborId of neighbors) {
      const sepSet = getSepSet(sepSets, id, neighborId).filter(x => nonParentNodes.indexOf(x) === -1)
      const messageReceived = messagesReceived!.get(neighborId)!
      const combinations = buildCombinations(network, sepSet)
      const message = createMessage(combinations, potentials!, messageReceived)
      const neighbor = cliques.find(x => x.id === neighborId)!

      absorvMessage(neighbor, message)
      distributeEvidence(neighborId)
    }

    unmark(id)
  }

  if (cliques.length > 1) {
    const nodes = junctionTree.getNodesId()
    const root = nodes[bestRootIndex()]

    unmarkAll()
    collectEvidence(root)

    unmarkAll()
    distributeEvidence(root)
  }
}
