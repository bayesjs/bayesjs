import { partition } from 'ramda'
import { CliqueId } from './common'
import { FastClique } from './FastClique'
import { Formula, mult, marginalize, reference } from './Formula'

type Messages = { [key: string]: Formula[] }

export const messageName = (sourceId: CliqueId, targetId: CliqueId) => `𝚿(${sourceId},${targetId})`

function isDConnected (x: number, target: number[]): boolean {
  console.log(`testing if ${x} is d-connected to ${target}`)
  return true
}

function isBarren (x: number): boolean {
  console.log(`testing if ${x} is barren`)
  return false
}

function isRelevantPotential (formula: Formula, target: number[]) {
  const { domain } = formula
  return domain.some((x: number) => isDConnected(x, target)) && domain.some((x: number) => !isBarren(x))
}

const passMessage = (sepSet: number[], messages: Messages, upsert: (f: Formula) => Formula, formulas: Formula[], src: FastClique, trg: FastClique) => {
  // Get all the messages that have been received by neighbors of the source
  // clique (other than the target).   These messages need to be passed on
  // to the target.
  const neighborMessages: Formula[] = []
  src.neighbors.forEach((neighborId: number) => {
    if (neighborId !== trg.id) { // don't pass a message back to the sender!
      const msg = messages[messageName(neighborId, src.id)]
      if (msg) neighborMessages.push(...msg)
    }
  })
  // Construct the factors for the message that will be passed to the target.
  // Each factor is either the clique potential or one of the messages to
  // the source clique, marginalized to remove any nodes that are not in
  // common between the source and target cliques.
  const factors: Formula[] = [reference(src.prior, formulas), ...neighborMessages]

  // remove the factors don't have any variables that are d connected to the
  // variables in the separation set.
  // TODO: UPDATE THIS FOR LAZY CAUTIOUS PROPAGATION.
  const relevantFactors: Formula[] = factors.filter(f => isRelevantPotential(f, sepSet))

  const [dontRequireMarginalization, requireMarginalization] = partition<Formula>((f: Formula) => f.domain.every(x => sepSet.includes(x)), relevantFactors)
  const msgs = [...dontRequireMarginalization]

  if (requireMarginalization.length > 0) {
    let marg: Formula
    if (requireMarginalization.length === 1) {
      marg = upsert(marginalize(sepSet, requireMarginalization[0], formulas))
    } else {
      const prod = upsert(mult(requireMarginalization))
      marg = upsert(marginalize(sepSet, prod, formulas))
    }
    msgs.push(marg)
  }

  messages[messageName(src.id, trg.id)] = msgs
}

const collectCliquesEvidence = (cliques: FastClique[], separators: number[][], messages: Messages, upsert: (f: Formula) => Formula, formulas: Formula[], rootId: CliqueId) => {
  // Determine the traversal order starting from the given node, recursively visiting
  // the neighbors of the given node.
  const process = (id: CliqueId, parentId?: CliqueId) => {
    const src = cliques[id]
    const { neighbors } = src
    for (const neighbor of neighbors) {
      if (parentId && neighbor === parentId) continue
      process(neighbor, id)
    }

    if (!parentId) return
    const trg = cliques[parentId]

    const neighborIndex: number = neighbors.findIndex(id => id === parentId)
    const sepSet = separators[src.separators[neighborIndex]]
    passMessage(sepSet, messages, upsert, formulas, src, trg)
  } //   // start processing from the best root node.
  process(rootId)
  return messages
}

const distributeCliquesEvidence = (cliques: FastClique[], separators: number[][], messages: Messages, upsert: (f: Formula) => Formula, formulas: Formula[], rootId: number) => {
  // Determine the traversal order starting from the given node, recursively visiting
  // the neighbors of the given node.

  const process = (id: CliqueId, parentId?: CliqueId) => {
    const src = cliques[id]
    src.neighbors.forEach((neighborId: number, idx: number) => {
      if (neighborId !== parentId) {
        const sepSet = separators[src.separators[idx]]
        const trg = cliques[neighborId]
        passMessage(sepSet, messages, upsert, formulas, src, trg)
        process(neighborId, id)
      }
    })
  }
  // start processing from the best root node.
  process(rootId)
  return messages
}

export const propagatePotentials = (cliques: FastClique[], separators: number[][], upsert: (f: Formula) => Formula, formulas: Formula[], roots: CliqueId[]): Messages => {
//   // Create a store for the messages passed between cliques.   Initially this store is empty because no messages have been passed.
  const messages: Messages = {}

  // Make each connected component of the factor graph consistent.    This is not strictly necessary for a well formed Bayes net
  // which should have single connected component, however during incremental construction or structural learning, networks which
  // are forests, rather than trees may occur.
  for (const rootId of roots) {
    // Update the potentials starting at the leaf nodes and moving to the roots
    collectCliquesEvidence(cliques, separators, messages, upsert, formulas, rootId)
    // Update the potentials starting at the root node and moving toward the leaves
    distributeCliquesEvidence(cliques, separators, messages, upsert, formulas, rootId)
  }

  return messages
}
