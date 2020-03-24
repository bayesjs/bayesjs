import {
  IClique,
  ICliqueGraph,
  IGraph,
  INetwork,
  ISepSet,
} from '../../types'
import { isNil, pipe } from 'ramda'

import { buildCliqueGraph } from '../../graphs/cliqueGraph'
import { buildJunctionTree } from '../../graphs/junctionTreeGraph'
import { buildMoralGraph } from '../../graphs/moralGraph'
import { buildTriangulatedGraph } from '../../graphs/triangulatedGraph'

interface ICreateCliquesResult {
  cliques: IClique[];
  sepSets: ISepSet[];
  junctionTree: IGraph;
}

const createCliquesWeakMap = new WeakMap<INetwork, ICreateCliquesResult>()

const createCliquesGraph: (network: INetwork) => ICliqueGraph = pipe(
  buildMoralGraph,
  buildTriangulatedGraph,
  buildCliqueGraph,
)

export default (network: INetwork): ICreateCliquesResult => {
  const cached = createCliquesWeakMap.get(network)

  if (isNil(cached)) {
    const { cliqueGraph, cliques, sepSets } = createCliquesGraph(network)
    const junctionTree = buildJunctionTree(cliqueGraph, cliques, sepSets)
    const result = { cliques, sepSets, junctionTree }

    createCliquesWeakMap.set(network, result)

    return result
  }

  return cached
}
