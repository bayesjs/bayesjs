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
  anyPass,
  append,
  assoc,
  curry,
  divide,
  equals,
  find,
  keys,
  map,
  multiply,
  path,
  pick,
  pipe,
  prop,
  reduce,
  sum,
} from 'ramda'
import {
  buildCombinations,
  objectEqualsByFirstObjectKeys,
} from '../../utils'
import { getConnectedComponents } from '../../utils/connected-components'

interface ICollectEvidenceOrder {
  id: string;
  parentId: string;
}

interface IDistributeEvidenceOrder {
  id: string;
  neighborId: string;
}

const hasSepSetCliques: (cliqueIdA: string, cliqueIdB: string) => (sepSet: ISepSet) => boolean =
curry((cliqueIdA: string, cliqueIdB: string, sepSet: ISepSet) =>
  sepSet.ca === cliqueIdB && sepSet.cb === cliqueIdA)

export const findSepSetWithCliques = (cliqueIdA: string, cliqueIdB: string, sepSets: ISepSet[]): ISepSet | undefined =>
  find(
    anyPass([
      hasSepSetCliques(cliqueIdA, cliqueIdB),
      hasSepSetCliques(cliqueIdB, cliqueIdA),
    ]),
    sepSets,
  )

const getSepSetForCliques = (network: INetwork, sepSets: ISepSet[], id: string, neighborId: string) => {
  const sepSet = findSepSetWithCliques(id, neighborId, sepSets)
  if (sepSet) return sepSet.sharedNodes.sort()
  throw new Error(`SepSet not found for cliques with id: "${id}" and "${neighborId}"`)
}

const createEmptyCombinations: (combinations: ICombinations[]) => ICliquePotentialItem[] =
  map(x => ({ when: x, then: 0 }))

const createMessagesByCliques: (cliques: IClique[]) => ICliquePotentialMessages = reduce(
  (acc, clique) => assoc(clique.id, new Map(), acc),
  {},
)

/** Marginalize the clique potentials modulo a separation set. */
export const marginalizePotentials = (network: INetwork, sepSet: string[], potentials: ICliquePotentialItem[]): ICliquePotentialItem[] =>
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
    createEmptyCombinations(buildCombinations(network, sepSet)),
  )

const dividePotentials = (dividend: ICliquePotentialItem[], divisor: ICliquePotentialItem[]) =>
  map(
    row => {
      const { when, then } = row
      const currentMessageReceived = divisor.find(potential => objectEqualsByFirstObjectKeys(when, potential.when))

      if (currentMessageReceived) {
        return assoc('then', divide(then, currentMessageReceived.then || 1), row)
      }

      return row
    },
    dividend,
  )

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

const passMessage = (network: INetwork, sepSets: ISepSet[], cliquesPotentials: ICliquePotentials, separatorPotentials: ICliquePotentialMessages, src: string, trg: string) => {
  const i = (src < trg) ? src : trg
  const j = (src < trg) ? trg : src
  const priorSeparatorPotential = separatorPotentials[i].get(j)
  const sepSet = getSepSetForCliques(network, sepSets, src, trg)
  const marginalizedSeparatorPotential = marginalizePotentials(network, sepSet, cliquesPotentials[src])
  const message = priorSeparatorPotential
    ? dividePotentials(marginalizedSeparatorPotential, priorSeparatorPotential)
    : marginalizedSeparatorPotential

  cliquesPotentials[trg] = absorbMessage(cliquesPotentials[trg], message)
  separatorPotentials[i].set(j, marginalizedSeparatorPotential)
}

const collectCliquesEvidence = (network: INetwork, junctionTree: IGraph, sepSets: ISepSet[], separatorPotentials: ICliquePotentialMessages, cliquesPotentials: ICliquePotentials, rootId: string) => {
  // Determine the traversal order starting from the given node, recursively visiting
  // the neighbors of the given node.
  const process = (id: string, parentId?: string) => {
    const neighbors = junctionTree.getNodeEdges(id)
    for (const neighbor of neighbors) {
      if (parentId && neighbor === parentId) continue
      process(neighbor, id)
    }

    if (!parentId) return
    passMessage(network, sepSets, cliquesPotentials, separatorPotentials, id, parentId)
  }

  // start processing from the best root node.
  process(rootId)
  return cliquesPotentials
}

const distributeCliquesEvidence = (network: INetwork, junctionTree: IGraph, sepSets: ISepSet[], separatorPotentials: ICliquePotentialMessages, cliquesPotentials: ICliquePotentials, rootId: string) => {
  // Determine the traversal order starting from the given node, recursively visiting
  // the neighbors of the given node.
  const process = (id: string, parentId?: string) => {
    const neighbors = junctionTree.getNodeEdges(id)

    for (const neighbor of neighbors) {
      if (parentId && neighbor === parentId) continue
      passMessage(network, sepSets, cliquesPotentials, separatorPotentials, id, neighbor)
      process(neighbor, id)
    }
  }

  // start processing from the best root node.
  process(rootId)
  return cliquesPotentials
}

export default (network: INetwork, junctionTree: IGraph, cliques: IClique[], sepSets: ISepSet[], cliquesPotentials: ICliquePotentials): ICliquePotentials => {
  // Create a store for the messages passed between cliques.   Initially this store is empty because no messages have been passed.
  const messages: ICliquePotentialMessages = createMessagesByCliques(cliques)
  const ccs: string[][] = getConnectedComponents(junctionTree)
  let potentials = cliquesPotentials

  // Make each connected component of the factor graph consistent.    This is not strictly necessary for a well formed Bayes net
  // which should have single connected component, however during incremental construction or structural learning, networks which
  // are forests, rather than trees may occur.
  for (const [rootId] of ccs) {
    // Update the potentials starting at the leaf nodes and moving to the roots
    const collectedCliquesPotentials = collectCliquesEvidence(network, junctionTree, sepSets, messages, potentials, rootId)
    // Update the potentials starting at the root node and moving toward the leaves
    potentials = distributeCliquesEvidence(network, junctionTree, sepSets, messages, collectedCliquesPotentials, rootId)
  }

  return potentials
}
