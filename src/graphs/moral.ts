import { addIndex, drop, forEach } from 'ramda'

import { IGraph } from '../types'
import { filterNodeWithParents } from '../utils'

const forEachIndexed = addIndex<string>(forEach)

export const createMoralGraph = (graph: IGraph): IGraph => {
  const moralGraph = graph.clone()

  forEach(
    node => {
      forEachIndexed(
        (nodeParentIdA, index) => {
          const nextParentIds = drop(index + 1, node.parents)

          forEach(
            nodeParentIdB => {
              if (moralGraph.hasNotEdge(nodeParentIdA, nodeParentIdB)) {
                moralGraph.addEdge(nodeParentIdA, nodeParentIdB)
              }
            },
            nextParentIds,
          )
        },
        node.parents,
      )
    },
    filterNodeWithParents(moralGraph.getNodes()),
  )

  return moralGraph
}
