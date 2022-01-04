import { partition, uniqBy } from 'ramda'
import { CliqueId } from './common'
import { FastClique } from './FastClique'
import { Formula, mult, marginalize, reference, FormulaType, EvidenceFunction } from './Formula'

type Messages = { [key: string]: Formula[] }

export const messageName = (sourceId: CliqueId, targetId: CliqueId) => `𝚿(${sourceId},${targetId})`

const passMessage = (sepSet: number[], messages: Messages, upsert: (f: Formula) => Formula, formulas: Formula[], src: FastClique, trg: FastClique) => {
  // Get all the messages that have been received by neighbors of the source
  // clique (other than the target).   These messages need to be passed on
  // to the target.
  const neighborMessages: Formula[] = []
  const neighborEvidence: EvidenceFunction[] = []
  src.neighbors.forEach((neighborId: number) => {
    if (neighborId !== trg.id) { // don't pass a message back to the sender!
      const msgs = messages[messageName(neighborId, src.id)]
      const [es, ms] = partition(m => m.kind === FormulaType.EVIDENCE_FUNCTION, msgs)
      neighborEvidence.push(...es as EvidenceFunction[])
      neighborMessages.push(...ms)
    }
  })
  // Construct the factors for the message that will be passed to the target.
  // Each factor is either the clique potential or one of the messages to
  // the source clique, marginalized to remove any nodes that are not in
  // common between the source and target cliques.
  const cliqueEvidence: EvidenceFunction[] = src.evidence.map(id => formulas[id] as EvidenceFunction)
  const evidence = uniqBy(x => x.id, [...cliqueEvidence, ...neighborEvidence])
  const factors: Formula[] = uniqBy(x => x.id, [reference(src.prior, formulas), ...neighborMessages])

  const [dontRequireMarginalization, requireMarginalization] = partition<Formula>((f: Formula) => f.domain.every(x => sepSet.includes(x)), factors)
  const msgs = [...dontRequireMarginalization, ...evidence.filter(x => dontRequireMarginalization.some(y => y.domain.includes(x.nodeId)))]
  if (requireMarginalization.length > 0) {
    let marg: Formula
    const es = evidence.filter(x => requireMarginalization.some(y => y.domain.includes(x.nodeId)))
    const ms = [...requireMarginalization, ...es]
    if (ms.length === 1) {
      marg = upsert(marginalize(sepSet, ms[0], formulas))
    } else {
      const prod = upsert(mult(ms))
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
      if (parentId != null && neighbor === parentId) continue
      process(neighbor, id)
    }

    if (parentId == null) return
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
