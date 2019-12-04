import {
  IClique,
  ICliquePotentialItem,
  ICombinations,
  ICptWithParents,
  ICptWithoutParents,
  IGraph,
  IInfer,
  INetwork,
  ISepSet,
  IStorage,
  IWeakStorage,
} from '../types'
import { buildCombinations, createStorage, createWeakStorage, flager } from '../utils'
import {
  buildJunctionTree,
  buildMoralGraph,
  buildTriangulatedGraph,
} from '../graphs'
import {
  cloneDeep,
  divide,
  intersection,
  isEqual,
  isUndefined,
  minBy,
  multiply,
  sum,
} from 'lodash'

import { buildCliqueGraph } from '../graphs/cliqueGraph'

const wmKey = new WeakMap()
const map = new Map()

const checkPotentialByNodes = (potential: ICliquePotentialItem, nodes: ICombinations): boolean => {
  const { when } = potential
  const whenNodeIds = Object.keys(when)

  return whenNodeIds.every(whenNodeId => {
    const whenValue = when[whenNodeId]
    const nodeValue = nodes[whenNodeId]

    return isUndefined(nodeValue) || whenValue === nodeValue
  })
}

const filterPotentialsByNodes = (potentials: ICliquePotentialItem[], nodes: ICombinations): ICliquePotentialItem[] => potentials.reduce((acc, potential) =>
  checkPotentialByNodes(potential, nodes) ? [...acc, potential] : acc
, [] as ICliquePotentialItem[])

const filterCliquesByNodes = (cliques: IClique[], nodes: ICombinations = {}) => {
  const nodesToInfer = Object.keys(nodes)

  return cliques.filter(clique =>
    clique.nodeIds.some(nodeId =>
      nodesToInfer.some(nodeToInfer =>
        nodeId === nodeToInfer,
      ),
    ),
  )
}

const getMinimalCliqueLength = (cliques: IClique[]) =>
  minBy(cliques, ({ nodeIds }) => nodeIds.length)

const getResult = (cliques: IClique[], nodes: ICombinations = {}) => {
  const cliquesNode = filterCliquesByNodes(cliques, nodes)
  const clique = getMinimalCliqueLength(cliquesNode)!
  const potentialsFiltred = filterPotentialsByNodes(clique.potentials!, nodes)
    .map(x => x.then)

  return sum(potentialsFiltred)
}

const getKeyNetwork = (storage: IWeakStorage<INetwork, string>, network: INetwork) => storage.getOrStore(
  network,
  () => {
    const obj = Object.keys(network)
      .reduce((p, nodeId) => {
        const { id, parents, states, cpt } = network[nodeId]
        p[id] = { id, parents, states, cpt }
        return p
      }, {} as INetwork)

    return JSON.stringify(obj)
  },
)

const getKeyGiven = (given: ICombinations) => {
  const keys = Object.keys(given)

  if (keys.length) {
    return keys.map(nodeId => ({ nodeId, state: given[nodeId] }))
      .reduce((str, { nodeId, state }) => `${str}-${nodeId}-${state}`, '')
  }

  return 'NO GIVEN'
}

const createCliquesInfo = (network: INetwork) => {
  const moralGraph = buildMoralGraph(network)
  const triangulatedGraph = buildTriangulatedGraph(moralGraph)
  const { cliqueGraph, cliques, sepSets } = buildCliqueGraph(triangulatedGraph)
  const junctionTree = buildJunctionTree(cliqueGraph, cliques, sepSets)

  return {
    emptyCliques: cliques,
    sepSets,
    junctionTree,
  }
}

const normalizePotentials = (potentials: ICliquePotentialItem[] = []) => {
  const thens = potentials.map(({ then }) => then)
  const total = sum(thens)
  const isZero = total === 0

  if (isZero) {
    return potentials
  } else {
    return potentials.map(({ when, then }) => ({
      when,
      then: divide(then, total),
    }))
  }
}

const normalizeCliques = (cliques: IClique[]): IClique[] => cliques.map(({ id, potentials, nodeIds }) => ({
  id,
  nodeIds,
  potentials: normalizePotentials(potentials),
}))

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
      when: cloneDeep(when),
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

const globalPropagation = (network: INetwork, junctionTree: IGraph, cliques: IClique[], sepSets: ISepSet[]) => {
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

const initializePotentials = (cliques: IClique[], network: INetwork, given: ICombinations) => {
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

const propagationCliques = (storage: IStorage<string, IClique[]>, cliques: IClique[], network: INetwork, junctionTree: IGraph, sepSets: ISepSet[], given: ICombinations = {}) => {
  const key = getKeyGiven(given)

  return storage.getOrStore(
    key,
    () => {
      initializePotentials(cliques, network, given)
      globalPropagation(network, junctionTree, cliques, sepSets)

      return normalizeCliques(cliques)
    },
  )
}

export const infer: IInfer = (network: INetwork, nodes: ICombinations, given?: ICombinations): number => {
  const storage = createStorage(map)
  const weakStorage = createWeakStorage(wmKey)
  const key = getKeyNetwork(weakStorage, network)
  const cliqueInfos = storage.getOrStore(
    key,
    () => {
      if (storage.clear) storage.clear()
      return createCliquesInfo(network)
    },
  )
  const { emptyCliques, sepSets, junctionTree } = cliqueInfos
  const cliques = propagationCliques(storage, emptyCliques, network, junctionTree, sepSets, given)

  // TODO: considerar P(A,B,C), por enquanto só P(A)
  return getResult(cliques, nodes)
}
