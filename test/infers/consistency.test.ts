'use strict'
import * as expect from 'expect'

import { allNodes } from '../../models/huge-network'
import { createNetwork, normalizeCliquePotential } from '../../src/utils'
import createCliques from '../../src/inferences/junctionTree/create-cliques'
import getCliquesPotentials from '../../src/inferences/junctionTree/get-cliques-potentials'
import { findSepSetWithCliques, marginalizePotentials } from '../../src/inferences/junctionTree/propagate-potentials'
import { ICliquePotentialItem } from '../../src'
import { getConnectedComponents } from '../../src/utils/connected-components'

/** After message passing between the potentials in the junciton tree, each clique potential for any
 * two adjacent cliques must be consistent.   Specifically, when they are marginalized over the
 * set of variables in their mutual separation set, the the marginals should be equivalent.   This
 * test verifies the consistency property for the huge-network junction tree.
 *
 * Note: In order to account for floating point rounding differences between each pair of
 * clique potentials, we adjust them to a precision of 4 decimal points in the significand of the
 * range of the potential.
*/

// process the network to construct junction tree, cliques and their potentials
const network = createNetwork(...allNodes)
const { cliques, sepSets, junctionTree } = createCliques(network)
const roots = getConnectedComponents(junctionTree).map(x => x[0])

const cliquesPotentials = getCliquesPotentials(cliques, network, junctionTree, sepSets, {}, roots)

// construct the list of pairs in the junction tree by traversal of nodes in depth first
// topological sorting order rooted on the first clique, returning a list of string pairs
// representing the identifiers of two adjacent cliques
function makePairs (id: string, parentId?: string): { src: string; trg: string }[] {
  const neighbors = junctionTree.getNodeEdges(id)
  const outArcs = []
  for (const neighbor of neighbors) {
    if (parentId && neighbor === parentId) continue
    outArcs.push({ src: id, trg: neighbor })
    outArcs.push(...makePairs(neighbor, id))
  }
  return outArcs
}

const pairs: { src: string; trg: string }[] = makePairs('0')

// construct the list of tests to perform.   For each pair of adjacent cliques,
// verify that their marginalized potentials are equivalent up to the specified
// precision.
const tests = pairs.map(pair =>
  ({
    name: `cliques ${pair.src} and ${pair.trg}`,
    fn: () => {
      // look up the clique potentials for the two adjacent cliques and get their separation set.
      const srcPotential: ICliquePotentialItem[] = cliquesPotentials[pair.src]
      const trgPotential: ICliquePotentialItem[] = cliquesPotentials[pair.trg]
      const mSepSet = findSepSetWithCliques(pair.src, pair.trg, sepSets)

      // if their separation set does not exist then exit
      expect('mSepSet').toBeTruthy()

      if (!mSepSet) return

      // construct the marginalized potentials for each clique and restrict to the specified
      // precision.
      const toPrecision = (xs: ICliquePotentialItem[], precision: number): ICliquePotentialItem[] =>
        xs.map((x: ICliquePotentialItem) => {
          const { when } = x
          const then: number = parseFloat(x.then.toPrecision(precision))
          return { when, then }
        })

      const sepSet = mSepSet.sharedNodes.sort()
      const srcPotentialMarginalized = toPrecision(normalizeCliquePotential(marginalizePotentials(network, sepSet, srcPotential)), 4)
      const trgPotentialMarginalized = toPrecision(normalizeCliquePotential(marginalizePotentials(network, sepSet, trgPotential)), 4)

      // We expect that the marginalized potentials are equivalent up to the specified
      // precision.
      expect(srcPotentialMarginalized).toEqual(trgPotentialMarginalized)
    },
  }),
)

describe('infers', () => {
  describe('hugeNetwork cliques', () => {
    for (const test of tests) {
      it(`The potentials for ${test.name} are consistent`, test.fn)
    }
  })
})
