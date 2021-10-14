
import { Product, Marginal, Formula, EvidenceFunction, FormulaType, Reference } from './Formula'
import { FastNode } from './FastNode'
import { FastPotential, combinationToIndex, indexToCombination } from './FastPotential'

import { FormulaId } from './common'

type MaybeFastPotential = FastPotential | null

/**
 * Evaluate the formula for taking the product of one or more potentials.  This function is
 * called by "evaluate" to handle the FormulaType.PRODUCT data case.   This function is O(n)
 * in the number of elements of the resulting potential.
 * @param productFormula - the symbolic representation of the product being evaulated
 * @param nodes - The collection of nodes in the inference engine.  This is used to
 *   locate locate nodes in the domain of the marginal and comprehend their properties
 * @param formulas - A list containing the symbolic representation of the potential functions
 *   of each clique, potential and term that occurs in the Bayes network.   This is used for
 *   evaluating the potential that is being marginalized
 * @param potentials - The collection of potentials corresponding to possibly cached results
 *   of evaluting the given list of formulas.  The list of potentials and list of formulas
 *   share the same ordering scheme such that the first potential corresponds to the cached
 *   result of evaluating the first potential, and so on.
 * NOTE: If this function computes a new value for the given formula or any of its terms,
 *   it will mutate the cache of potentials to update the cached values.
 *
 * @example: The product of two potentials A and B prior to normalization is exemplified
 *  below:
 *
 *   | A   |     |     | B   |     |   |  A  |  B  |           |
 *   | --- | --- |     | --- | --- |   | --- | --- | --------- |
 *   |  a1 | 0.7 |  x  | b1  | 0.4 | = |  a1 |  b1 | 0.7 * 0.4 |
 *   |  a2 | 0.2 |     | b2  | 0.6 |   |  a2 |  b1 | 0.2 * 0.4 |
 *   |  a3 | 0.1 |                     |  a3 |  b1 | 0.1 * 0.4 |
 *                                     |  a1 |  b2 | 0.7 * 0.6 |
 *                                     |  a2 |  b2 | 0.2 * 0.6 |
 *                                     |  a3 |  b2 | 0.1 * 0.6 |
 */
const evaluateProduct = (productFormula: Product, nodes: FastNode[], formulas: Formula[], potentials: MaybeFastPotential[]): FastPotential => {
  // first we need to evaluate the factors that are being multiplied together.
  const factorFormulas = productFormula.factorIds.map(factorId => formulas[factorId])
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const factorPotentials: FastPotential[] = productFormula.factorIds.map(factorId => evaluate(factorId, nodes, formulas, potentials))
  // short cuts for nullary and unary products
  if (factorPotentials.length === 0) {
    const result: FastPotential = []
    potentials[productFormula.id] = result // unit potential
    return result
  }
  if (factorPotentials.length === 1) {
    // eslint-disable-next-line prefer-destructuring
    potentials[productFormula.id] = factorPotentials[0]
    return factorPotentials[0]
  }

  // If we arrived here, there are at least two factors.  We start by initializing
  // an array for multiplicatively accumulating the potential values
  const factorNumberOfLevels = factorFormulas.map(formula => formula.numberOfLevels)
  const result: number[] = Array(productFormula.size).fill(1)
  // Next we need to know how to map the variables (nodes/columns) in the domain
  // of each factor map to the variables (nodes/columns) in the domain of the
  // product.   We construct a list where each element is the mapping for a
  // variable that occurs in a factor to the ordinal position at which it occurs
  // in the domain of the product.
  const productDomain = productFormula.domain
  const factsIdxToKeep: number[][] = factorFormulas.map((factor: Formula) => factor.domain.map((id: number) => productDomain.findIndex((x: number) => x === id)))
  let total = 0
  // Here we iterate over each row of the product potential, multiplicatively
  // accumulating each of the corresponding values from each factor potential.
  // This is facilitated by the indexing scheme of the values in the fast
  // potentials.   Given some combination of the levels we can compute the
  // index at which the corresponding value occurs.
  result.forEach((_, rowId) => {
    // const fs: number[] = []
    // convert the row in the new potential function to a combination of
    // variable levels.
    const combos = indexToCombination(rowId, productFormula.numberOfLevels)
    // iterate over each factor potential, finding the corresponding entry
    // and multiplicatively accumulating it into the result.
    factorPotentials.forEach((vs, factorId) => {
      const factCombo = factsIdxToKeep[factorId].map((idx: number) => combos[idx])
      const factId = combinationToIndex(factCombo, factorNumberOfLevels[factorId])
      result[rowId] *= vs[factId]
    })
    total += result[rowId]
  })

  // Cache the normalized potential function and return it.
  const normalizedResult = total > 0 ? result.map(v => v / total) : result
  potentials[productFormula.id] = normalizedResult
  // console.log(`${productFormula.id}: ${productFormula.name} ::{${productFormula.domain}}= [${normalizedResult}]`)
  return normalizedResult
}

/**
 * Evaluate the formula for marginalizing a variable.  This function is called by "evaluate"
 * to handle the FormulaType.MARGINAL data case.   This function is O(n) in the number of
 * elements of the original potential.
 * @param marginalFormula - the symbolic representation of the marginal being evaulated
 * @param nodes - The collection of nodes in the inference engine.  This is used to
 *   locate locate nodes in the domain of the marginal and comprehend their properties
 * @param formulas - A list containing the symbolic representation of the potential functions
 *   of each clique, potential and term that occurs in the Bayes network.   This is used for
 *   evaluating the potential that is being marginalized
 * @param potentials - The collection of potentials corresponding to possibly cached results
 *   of evaluting the given list of formulas.  The list of potentials and list of formulas
 *   share the same ordering scheme such that the first potential corresponds to the cached
 *   result of evaluating the first potential, and so on.
 * NOTE: If this function computes a new value for the given formula or any of its terms,
 *   it will mutate the cache of potentials to update the cached values.
 *
 * @example: The result of marginalization of a potential over {B} prior to normalization
 *  is exemplified below:
 *
 *        |  A  |  B  |           |    | A   |                   |
 *  ----  | --- | --- | --------- |    | --- | ----------------- |
 *  \     |  a1 |  b1 | 0.7 * 0.4 |    |  a1 | 0.7 * (0.4 + 0.6) |
 *    \   |  a2 |  b1 | 0.2 * 0.4 |    |  a2 | 0.2 * (0.4 + 0.6) |
 *    /   |  a3 |  b1 | 0.1 * 0.4 |  = |  a3 | 0.1 * (0.4 + 0.6) |
 *  /     |  a1 |  b2 | 0.7 * 0.6 |
 *  ----  |  a2 |  b2 | 0.2 * 0.6 |
 *    {B} |  a3 |  b2 | 0.1 * 0.6 |
 *
 */
const evaluateMarginal = (marginalFormula: Marginal, nodes: FastNode[], formulas: Formula[], potentials: MaybeFastPotential[]): FastPotential => {
  // First we need to evaluate the formula for the potential that is being marginalized.
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const innerPotential: FastPotential = evaluate(marginalFormula.potential, nodes, formulas, potentials)
  const innerFormula = formulas[marginalFormula.potential]
  // Marginalization will remove zero or more variables (nodes) from the distribution.
  // We need to know which nodes are retained after the marginalization.
  const { domain } = innerFormula
  const nodesToKeep = domain.filter((x) => marginalFormula.domain.includes(x))
  // If all the nodes are being kept, then no work is required.  We can simply
  // return the original distribution
  if (nodesToKeep.length === domain.length) {
    potentials[marginalFormula.id] = innerPotential
    return innerPotential
  }
  // If we got here, then one or more nodes need to be marginalized from the given
  // potential.  The resulting potential function should be the result of
  // additively accumulating the potentials grouped on like values of the remaining
  // nodes.   Because the fast potential structure uses an integer indexing scheme
  // which encodes the values of the variables, we need to know how to convert between
  // indices in the original potential function and the result.  We start by
  // populating an empty array with the correct number of entries for  the new
  // potential function.
  const IdxsToKeep: number[] = nodesToKeep.map(x => domain.findIndex(y => x === y))
  const result: number[] = Array(marginalFormula.size).fill(0)
  let total = 0
  // For each value in the old potential function, we convert its index to
  // the combinations (levels) of the variables.   We then filter out the
  // columns that don't appear in the new potential and reorder the
  // remaining combinations so that they match the order of the nodes in the
  // domain of the new potential function.  Given this new set of combinations
  // we can compute the correct index in the resultant potential and add
  // the old potential's value to that element.
  innerPotential.forEach((v, i) => {
    const combos = indexToCombination(i, innerFormula.numberOfLevels)
    const idx = combinationToIndex(IdxsToKeep.map(idx => combos[idx]), marginalFormula.numberOfLevels)
    result[idx] += v
    total += v
  })
  // Normalize the potential so that it is a probability distribution.
  const normalizedResult = total > 0 ? result.map(v => v / total) : result
  // console.log(`${marginalFormula.id}: ${marginalFormula.name} ::{${marginalFormula.domain}}= [${normalizedResult}]`)
  potentials[marginalFormula.id] = normalizedResult
  return normalizedResult
}

const evaluateEvidence = (evidenceFunction: EvidenceFunction) => {
  // if no evidence is provided, then we can return the inner potential
  if (evidenceFunction.level == null) {
    return Array(evidenceFunction.size).fill(1 / evidenceFunction.size)
  }
  return Array(evidenceFunction.size).map((_, i) => i === evidenceFunction.level ? 1 : 0)
}

/**
 * Recursively evaluate a formula for a potential.
 * @param marginalFormula - the symbolic representation of the marginal being evaulated
 * @param nodes - The collection of nodes in the inference engine.  This is used to
 *   locate locate nodes in the domain of the marginal and comprehend their properties
 * @param formulas - A list containing the symbolic representation of the potential functions
 *   of each clique, potential and term that occurs in the Bayes network.   This is used for
 *   evaluating the potential that is being marginalized
 * @param potentials - The collection of potentials corresponding to possibly cached results
 *   of evaluting the given list of formulas.  The list of potentials and list of formulas
 *   share the same ordering scheme such that the first potential corresponds to the cached
 *   result of evaluating the first potential, and so on.
 * NOTE: If this function computes a new value for the given formula or any of its terms,
 *   it will mutate the cache of potentials to update the cached values.
 */
export const evaluate = (formulaId: FormulaId, nodes: FastNode[], formulas: Formula[], potentials: MaybeFastPotential[]): FastPotential => {
  const cachedValue = potentials[formulaId]
  if (cachedValue) {
    // A cached value already exists.  Return it.
    return cachedValue
  } else {
    const formula = formulas[formulaId]
    switch (formula.kind) {
      case FormulaType.PRODUCT: {
        // recursively evaulate the product and all of its factors.
        const productFormula = formula as Product
        return evaluateProduct(productFormula, nodes, formulas, potentials)
      }
      case FormulaType.MARGINAL: {
        // Recursively evaluate the marginalization of a potential function.
        const marginalFormula = formula as Marginal
        return evaluateMarginal(marginalFormula, nodes, formulas, potentials)
      }
      case FormulaType.REFERENCE: {
        // If the formula is a reference, evaluate the referenced potential
        const ref = formula as Reference
        const result = evaluate(ref.formulaId, nodes, formulas, potentials)
        // console.log(`${ref.id}: ${ref.name} ::{${ref.domain}}= [${result}]`)
        return result
      }
      case FormulaType.EVIDENCE_FUNCTION: {
        const evidenceFunction = formula as EvidenceFunction
        return evaluateEvidence(evidenceFunction)
      }
      case FormulaType.UNIT:
        // Note, there is only one implementation of the unit potential function.
        return []
      case FormulaType.NODE_POTENTIAL: throw new Error(`The node potential function for node ${nodes[formulaId]}} was not provided`)
    }
  }
}
