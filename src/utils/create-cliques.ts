import { IClique, IGraph } from '../types'
import { append, difference, intersection, isEmpty, reduce, union } from 'ramda'

const getPivotsMaker = (graph: IGraph) => (P: string[], X: string[]): string[] => reduce(
  (acc, nodeId) => {
    const nodeIds = intersection(graph.getNodeEdges(nodeId), P)

    if (nodeIds.length > acc.length) {
      return nodeIds
    }

    return acc
  },
  [] as string[],
  union<string>(P, X),
)

const bronKerbosch2Maker = (graph: IGraph, onFindClique: (clique: string[]) => void) => {
  const getPivots = getPivotsMaker(graph)

  const bronKerbosch2 = (R: string[], P: string[], X: string[]) => {
    if (isEmpty(P) && isEmpty(X)) {
      onFindClique(R)
    }

    const pivots = getPivots(P, X)

    for (const v of difference(P, pivots)) {
      const neighbors = graph.getNodeEdges(v)

      bronKerbosch2(
        append(v, R),
        intersection(P, neighbors),
        intersection(X, neighbors),
      )
      const removeIndexP = P.indexOf(v)

      P.splice(removeIndexP, 1)
      X.push(v)
    }
  }

  return bronKerbosch2
}

export const createCliques = (graph: IGraph): IClique[] => {
  let id = 0
  const cliques: IClique[] = []
  const bronKerbosch2 = bronKerbosch2Maker(graph, nodeIds => {
    cliques.push({
      id: `${id++}`,
      nodeIds,
    })
  })

  bronKerbosch2([], graph.getNodesId(), [])

  return cliques
}
