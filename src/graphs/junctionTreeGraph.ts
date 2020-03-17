import { IClique, IGraph, ISepSet } from '../types'

// this can be removed when ">= 11" and use the NodeJS sort method
import { sort } from 'timsort'

export const buildJunctionTree = (cliqueGraph: IGraph, cliques: IClique[], sepSets: ISepSet[]): IGraph => {
  sort(sepSets, (a, b) => a.sharedNodes.length - b.sharedNodes.length)

  const spanningTree: ISepSet[] = []

  const hasCycle = () => {
    const visited: { [key: string]: boolean } = {}

    const visit = (cliqueId: string, parentId?: string) => {
      visited[cliqueId] = true

      const adjsA = spanningTree
        .filter(x => x.ca === cliqueId)
        .map(x => x.cb)

      const adjsB = spanningTree
        .filter(x => x.cb === cliqueId)
        .map(x => x.ca)

      const adjs = adjsA.concat(adjsB)

      for (const adj of adjs) {
        if (!visited[adj]) {
          if (visit(adj, cliqueId)) {
            return true
          }
        } else if (adj !== parentId) {
          return true
        }
      }

      return false
    }

    for (let i = 0; i < cliques.length; i++) {
      visited[cliques[i].id] = false
    }

    for (let i = 0; i < cliques.length; i++) {
      if (!visited[cliques[i].id]) {
        if (visit(cliques[i].id)) {
          return true
        }
      }
    }

    return false
  }

  for (let i = 0; i < sepSets.length; i++) {
    spanningTree.push(sepSets[i])

    if (hasCycle()) {
      spanningTree.pop()
    }
  }

  const junctionTree = cliqueGraph.clone()

  for (let i = sepSets.length - 1; i >= 0; i--) {
    const sepSet = sepSets[i]
    const shouldRemove = !spanningTree.some(x => x === sepSet)

    if (shouldRemove) {
      junctionTree.removeEdge(sepSet.ca, sepSet.cb)
      sepSets.splice(i, 1)
    }
  }

  return junctionTree
}
