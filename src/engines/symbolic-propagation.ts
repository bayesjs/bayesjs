import { CliqueId } from './common'
import { FastClique } from './FastClique'
import { Formula, FormulaType, Reference, mult, marginalize, reference } from './Formula'

type Messages = { [key: string]: Formula }

export const messageName = (sourceId: CliqueId, targetId: CliqueId) => `𝚿(${sourceId},${targetId})`

const passMessage = (sepSet: number[], messages: { [key: string]: Formula}, formulas: Formula[], src: FastClique, trg: FastClique) => {
  // Get all the messages that have been received by neighbors of the source
  // clique (other than the target).   These messages need to be passed on
  // to the target.
  const neighborMessages: Formula[] = []
  src.neighbors.forEach((neighborId: number) => {
    if (neighborId !== trg.id) { // don't pass a message back to the sender!
      const msg = messages[messageName(neighborId, src.id)]
      if (msg) neighborMessages.push(msg)
    }
  })
  // Construct the factors for the message that will be passed to the target.
  // Each factor is either the clique potential or one of the messages to
  // the source clique, marginalized to remove any nodes that are not in
  // common between the source and target cliques.
  const factors = [reference(src.prior, formulas), ...neighborMessages]
  let prod = mult(factors)
  if (!messages[prod.name]) {
    messages[prod.name] = prod
    prod.id = formulas.length
    formulas.push(prod)
  }

  prod = messages[prod.name]
  const msg = marginalize(sepSet, prod, formulas)
  // const marginals: Formula[] = []
  // factors.forEach(formula => {
  //   const f: Formula = marginalize(sepSet, formula, formulas)
  //   let marginal
  //   if (messages[f.name]) {
  //     marginals.push(messages[f.name])
  //   } else {
  //   // Cache the formulas for the marginals so that they can be reused if they
  //   // appear in more than one expression.
  //     if (f.kind !== FormulaType.REFERENCE) {
  //       f.id = formulas.length
  //       formulas.push(f)
  //       marginal = reference(f.id, formulas)
  //       messages[f.name] = marginal
  //       marginals.push(marginal)
  //     } else {
  //       marginals.push(f)
  //     }
  //   }
  // })
  // compute the message to be passed.
  const ref = messages[msg.name]
  if (ref) {
    messages[messageName(src.id, trg.id)] = ref
  } else {
    if (![FormulaType.REFERENCE, FormulaType.UNIT].includes(msg.kind)) {
      msg.id = formulas.length
      formulas.push(msg)
      messages[messageName(src.id, trg.id)] = new Reference(msg.id, formulas)
    } else {
      messages[messageName(src.id, trg.id)] = msg
    }
  }
}

const collectCliquesEvidence = (cliques: FastClique[], separators: number[][], messages: Messages, potentials: Formula[], rootId: CliqueId) => {
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
    passMessage(sepSet, messages, potentials, src, trg)
  } //   // start processing from the best root node.
  process(rootId)
  return messages
}

const distributeCliquesEvidence = (cliques: FastClique[], separators: number[][], messages: Messages, potentials: Formula[], rootId: number) => {
  // Determine the traversal order starting from the given node, recursively visiting
  // the neighbors of the given node.

  const process = (id: CliqueId, parentId?: CliqueId) => {
    const src = cliques[id]
    src.neighbors.forEach((neighborId: number, idx: number) => {
      if (neighborId !== parentId) {
        const sepSet = separators[src.separators[idx]]
        const trg = cliques[neighborId]
        passMessage(sepSet, messages, potentials, src, trg)
        process(neighborId, id)
      }
    })
  }
  // start processing from the best root node.
  process(rootId)
  return messages
}

export const propagatePotentials = (cliques: FastClique[], separators: number[][], formulas: Formula[], roots: CliqueId[]): Messages => {
//   // Create a store for the messages passed between cliques.   Initially this store is empty because no messages have been passed.
  const messages: Messages = {}

  // Make each connected component of the factor graph consistent.    This is not strictly necessary for a well formed Bayes net
  // which should have single connected component, however during incremental construction or structural learning, networks which
  // are forests, rather than trees may occur.
  for (const rootId of roots) {
    // Update the potentials starting at the leaf nodes and moving to the roots
    collectCliquesEvidence(cliques, separators, messages, formulas, rootId)
    // Update the potentials starting at the root node and moving toward the leaves
    distributeCliquesEvidence(cliques, separators, messages, formulas, rootId)
  }

  return messages
}
