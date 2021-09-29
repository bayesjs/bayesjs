import { IGraph } from '..'
import { reduce } from 'ramda'

/** Find the connected components of the clique graph.  Complexity is on the
 * order O(n m) where n is the number of cliques and m is the number of separation
 * sets.   This complexity could be reduced to n (log m) by using a more efficient
 * means of finding
 */
export const getConnectedComponents = (junctionTree: IGraph) => {
  const ids: string[] = junctionTree.getNodesId()
  const visited: Set<string> = new Set<string>()
  const ccs = []

  const process = (id: string): string[] => {
    const neighbors = junctionTree.getNodeEdges(id)
    const notVisitedNeighbors = neighbors.filter((z: string) => !visited.has(z))

    visited.add(id)

    return reduce(
      (result, neighbor) => {
        result.push(...process(neighbor))
        return result
      },
      [id],
      notVisitedNeighbors,
    )
  }

  for (const id of ids) {
    if (!visited.has(id)) ccs.push(process(id))
  }

  return ccs
}
