import { ICliqueGraph, IGraph, ISepSet } from '../types'

import { createGraph } from '.'
import { findCliques } from '../utils/bronKerbosch'

export const buildCliqueGraph = (triangulatedGraph: IGraph): ICliqueGraph => {
  const cliqueGraph = createGraph()
  const cliques = findCliques(triangulatedGraph)
  const sepSets: ISepSet[] = []

  for (let i = 0; i < cliques.length; i++) {
    cliqueGraph.addNodeId(cliques[i].id)

    for (let j = i + 1; j < cliques.length; j++) {
      if (i === j) {
        continue
      }

      const sharedNodes = []

      for (let k = 0; k < cliques[j].nodeIds.length; k++) {
        if (cliques[i].nodeIds.some(x => x === cliques[j].nodeIds[k])) {
          sharedNodes.push(cliques[j].nodeIds[k])
        }
      }

      if (sharedNodes.length > 0) {
        cliqueGraph.addEdge(cliques[i].id, cliques[j].id)
        sepSets.push({ ca: cliques[i].id, cb: cliques[j].id, sharedNodes })
      }
    }
  }

  return {
    cliqueGraph,
    cliques,
    sepSets,
  }
}
