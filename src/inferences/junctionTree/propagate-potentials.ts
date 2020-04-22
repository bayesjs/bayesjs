import {
  IClique,
  ICliquePotentialItem,
  ICliquePotentialMessages,
  ICliquePotentials,
  ICombinations,
  IGraph,
  INetwork,
  ISepSet,
} from '../../types'
import {
  any,
  anyPass,
  append,
  assoc,
  curry,
  divide,
  equals,
  find,
  head,
  keys,
  map,
  multiply,
  path,
  pick,
  pipe,
  prop,
  reduce,
  reject,
  sum,
} from 'ramda'
import {
  buildCombinations,
  getNodeIdsWithoutParents,
  includesFlipped,
  objectEqualsByFirstObjectKeys,
  sortStringsAsc,
} from '../../utils'

interface ICollectEvidenceOrder {
  id: string;
  parentId: string;
}

interface IDistributeEvidenceOrder {
  id: string;
  neighborId: string;
}

const hasSepSetCliques = curry((cliqueIdA: string, cliqueIdB: string, sepSet: ISepSet) =>
  sepSet.ca === cliqueIdB && sepSet.cb === cliqueIdA)

const findSepSetWithCliques = (cliqueIdA: string, cliqueIdB: string, sepSets: ISepSet[]): ISepSet | undefined =>
  find(
    anyPass([
      hasSepSetCliques(cliqueIdA, cliqueIdB),
      hasSepSetCliques(cliqueIdB, cliqueIdA),
    ]),
    sepSets,
  )

const getSepSetForCliques = (network: INetwork, sepSets: ISepSet[], id: string, neighborId: string) => {
  const sepSet = findSepSetWithCliques(id, neighborId, sepSets)

  if (sepSet) {
    const nonParentNodes = getNodeIdsWithoutParents(network)

    return reject(
      includesFlipped(nonParentNodes),
      sortStringsAsc(sepSet.sharedNodes),
    )
  }

  throw new Error(`SepSet not found for cliques with id: "${id}" and "${neighborId}"`)
}

const createEmptyCombinations: (combinations: ICombinations[]) => ICliquePotentialItem[] =
  map(x => ({ when: x, then: 0 }))

const createMessagesByCliques: (cliques: IClique[]) => ICliquePotentialMessages = reduce(
  (acc, clique) => assoc(clique.id, new Map(), acc),
  {},
)

const createInitialMessage = (combinations: ICombinations[], potentials: ICliquePotentialItem[]) =>
  reduce(
    (acc, cpt) => {
      const then = sum(
        potentials
          .filter(potential => objectEqualsByFirstObjectKeys(cpt.when, potential.when))
          .map(prop('then')),
      )
      const newCpt = assoc('then', then, cpt)

      return append(newCpt, acc)
    },
    [] as ICliquePotentialItem[],
    createEmptyCombinations(combinations),
  )

const mergeMessages = (messageA: ICliquePotentialItem[], messageB: ICliquePotentialItem[]) =>
  map(
    row => {
      const { when, then } = row
      const currentMessageReceived = messageB.find(potential => objectEqualsByFirstObjectKeys(when, potential.when))

      if (currentMessageReceived) {
        return assoc('then', divide(then, currentMessageReceived.then || 1), row)
      }

      return row
    },
    messageA,
  )

const createMessage = (combinations: ICombinations[], potentials: ICliquePotentialItem[], messageReceived?: ICliquePotentialItem[]): ICliquePotentialItem[] => {
  const message = createInitialMessage(combinations, potentials)

  if (messageReceived) {
    return mergeMessages(message, messageReceived)
  }

  return message
}

const getFirstWhenKeys: (obj: ICliquePotentialItem[]) => string[] = pipe(path([0, 'when']), keys)

const isWhenEqualsByKeys = (keys: string[], row: ICliquePotentialItem, potential: ICliquePotentialItem) => {
  const pickKeys = pick(keys)

  return equals(pickKeys(row.when), pickKeys(potential.when))
}

const absorbMessageWithPotential = curry((messagePotentialsKeys: string[], messagePotential: ICliquePotentialItem, potential: ICliquePotentialItem) => {
  if (isWhenEqualsByKeys(messagePotentialsKeys, messagePotential, potential)) {
    return assoc('then', multiply(potential.then, messagePotential.then), potential)
  }
  return potential
})

const absorbMessage = (potentials: ICliquePotentialItem[], messagePotentials: ICliquePotentialItem[]): ICliquePotentialItem[] => {
  const messagePotentialsKeys = getFirstWhenKeys(messagePotentials)
  const updater = absorbMessageWithPotential(messagePotentialsKeys)

  return reduce(
    (acc, messagePotential) => map(updater(messagePotential), acc),
    potentials,
    messagePotentials,
  )
}

const bestCliqueRoot: (cliques: IClique[]) => IClique = head

const getCollectEvidenceOrder = (cliques: IClique[], junctionTree: IGraph) => {
  const order: ICollectEvidenceOrder[] = []
  const mark = new Set()
  const cliqueRoot = bestCliqueRoot(cliques)

  const process = (id: string, parentId?: string) => {
    mark.add(id)

    const neighbors = junctionTree.getNodeEdges(id).filter(cliqueId => !mark.has(cliqueId))

    for (const neighbor of neighbors) {
      process(neighbor, id)
    }

    if (parentId) {
      order.push({ id, parentId })
    }
  }

  process(cliqueRoot.id)

  return order
}

const getDistributeEvidenceOrder = (cliques: IClique[], junctionTree: IGraph) => {
  const order: IDistributeEvidenceOrder[] = []
  const mark = new Set()
  const cliqueRoot = bestCliqueRoot(cliques)

  const process = (id: string) => {
    mark.add(id)

    const neighbors = junctionTree.getNodeEdges(id).filter(cliqueId => !mark.has(cliqueId))

    for (const neighborId of neighbors) {
      order.push({ id, neighborId })
      process(neighborId)
    }
  }

  process(cliqueRoot.id)

  return order
}

const hasCliquePotentialAlreadyBeenAbsorbed = (messagesReceived: Map<string, ICliquePotentialItem[]>, message: ICliquePotentialItem[]): boolean => {
  const messagesArray = [...messagesReceived.values()]

  return any(equals(message), messagesArray)
}

const collectCliquesEvidence = (network: INetwork, junctionTree: IGraph, cliques: IClique[], sepSets: ISepSet[], messages: ICliquePotentialMessages, cliquesPotentials: ICliquePotentials) =>
  reduce(
    (acc, { id, parentId }) => {
      const potentials = acc[id]
      const sepSet = getSepSetForCliques(network, sepSets, id, parentId)
      const combinations = buildCombinations(network, sepSet)
      const message = createMessage(combinations, potentials)
      const messagesReceived = messages[parentId]

      if (hasCliquePotentialAlreadyBeenAbsorbed(messagesReceived, message)) {
        return acc
      }

      messagesReceived.set(id, message)
      return assoc(parentId, absorbMessage(acc[parentId], message), acc)
    },
    cliquesPotentials,
    getCollectEvidenceOrder(cliques, junctionTree),
  )

const distributeCliquesEvidence = (network: INetwork, junctionTree: IGraph, cliques: IClique[], sepSets: ISepSet[], messages: ICliquePotentialMessages, cliquesPotentials: ICliquePotentials) =>
  reduce(
    (acc, { id, neighborId }) => {
      const potentials = acc[id]
      const messagesReceived = messages[id]
      const sepSet = getSepSetForCliques(network, sepSets, id, neighborId)
      const messageReceived = messagesReceived.get(neighborId)!
      const combinations = buildCombinations(network, sepSet)
      const message = createMessage(combinations, potentials!, messageReceived)

      return assoc(neighborId, absorbMessage(acc[neighborId], message), acc)
    },
    cliquesPotentials,
    getDistributeEvidenceOrder(cliques, junctionTree),
  )

export default (network: INetwork, junctionTree: IGraph, cliques: IClique[], sepSets: ISepSet[], cliquesPotentials: ICliquePotentials): ICliquePotentials => {
  const messages: ICliquePotentialMessages = createMessagesByCliques(cliques)
  const collectedCliquesPotentials = collectCliquesEvidence(network, junctionTree, cliques, sepSets, messages, cliquesPotentials)

  return distributeCliquesEvidence(network, junctionTree, cliques, sepSets, messages, collectedCliquesPotentials)
}
