
import { Product, Marginal, Formula, EvidenceFunction, FormulaType, Reference } from './Formula'
import { FastNode } from './FastNode'
import { FastPotential, combinationToIndex, indexToCombination } from './FastPotential'

import { FormulaId } from './common'
import { product } from 'ramda'

type MaybeFastPotential = FastPotential | null

/**
 * Evaluate the formula for taking the product of one or more potentials.  This function is
 * called by "evaluate" to handle the FormulaType.PRODUCT data case.   This function is O(n)
 * in the number of elements of the resulting potential.
 * @param factorsPotentials - the potential functions for the factors
 * @param factorsDomains - An array of the domains of each of the factors
 * @param factorNumberOfLevels - An array of the number of levels in each of a factor's domain variables
 * @param productDomain - The domain of the product
 * @param productNumberOfLevels -The number of levels in each of the product's domain variables
 * @param productSize - the number of rows in the product's cpt.  This should be the product of the
 *   number of levels.
 * NOTE: This function is pure, and does not make any changes to the nodes, formulas or potentials.
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
export const evaluateProductPure = (factorPotentials: FastPotential[], factorDomains: number[][], factorNumberOfLevels: number[][], productDomain: number[], productNumberOfLevels: number[], productSize: number): FastPotential => {
  // short cuts for nullary and unary products
  if (factorPotentials.length === 0) {
    const result: FastPotential = []
    return result
  }
  const result: number[] = Array(productSize).fill(1)
  const factsIdxToKeep: number[][] = factorDomains.map((domain: number[]) => domain.map((id: number) => productDomain.findIndex((x: number) => x === id)))
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
    const combos = indexToCombination(rowId, productNumberOfLevels)
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
  return normalizedResult
}

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
  // if (factorPotentials.length === 1) {
  //   // eslint-disable-next-line prefer-destructuring
  //   potentials[productFormula.id] = factorPotentials[0]
  //   return factorPotentials[0]
  // }

  // If we arrived here, there are at least two factors.  We start by initializing
  // an array for multiplicatively accumulating the potential values
  const factorNumberOfLevels = factorFormulas.map(formula => formula.numberOfLevels)
  const factorDomains = factorFormulas.map((x: Formula) => x.domain)
  const productDomain = productFormula.domain
  const productNumberOfLevels = productDomain.map(i => nodes[i].levels.length)

  const result = evaluateProductPure(
    factorPotentials,
    factorDomains,
    factorNumberOfLevels,
    productDomain,
    productNumberOfLevels,
    product(productNumberOfLevels),
  )
  potentials[productFormula.id] = result
  return result
}

/**
 * Marginalize a potential function directly (no formulas).  This function is called by "evaluate"
 * to handle the FormulaType.MARGINAL data case.   This function is O(n) in the number of
 * elements of the original potential.
 * @param innerPotential - the potential function to marginalize
 * @param innerDomain - the domain of the potential function being marginalized
 * @param innerNumberOfLevels - The number of levels of each of the variables occuring in the
 *   domain of the inner potential
 * @param marginalDomain - the domain of the potential function after marginalization.   It
 *   must contain a distinct subset of the elements of the inner potential function's domain
 *   but can be in any order.
 * @param marginalNumberOfLevels - the number of levels in each of the variables occuring in the
 *   domain of the marginal.
 * @param marginalSize - The number of elements in the CPT of the potential function.   This should
 *   be the product of the marginalNumberOfLevels.
 * NOTE: This function is pure, and does not mutate any of the formulas or potentials.
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

export function evaluateMarginalPure (innerPotential: FastPotential, innerDomain: number[], innerNumberOfLevels: number[], marginalDomain: number[], marginalNumberOfLevels: number[], marginalSize: number): FastPotential {
  const IdxsToKeep: number[] = marginalDomain.map(x => innerDomain.findIndex(y => x === y))
  const result: number[] = Array(marginalSize).fill(0)
  let total = 0
  // For each value in the old potential function, we convert its index to
  // the combinations (levels) of the variables.   We then filter out the
  // columns that don't appear in the new potential and reorder the
  // remaining combinations so that they match the order of the nodes in the
  // domain of the new potential function.  Given this new set of combinations
  // we can compute the correct index in the resultant potential and add
  // the old potential's value to that element.
  innerPotential.forEach((v, i) => {
    const combos = indexToCombination(i, innerNumberOfLevels)
    const idx = combinationToIndex(IdxsToKeep.map(idx => combos[idx]), marginalNumberOfLevels)
    result[idx] += v
    total += v
  })
  // Normalize the potential so that it is a probability distribution.
  const normalizedResult = total > 0 ? result.map(v => v / total) : result
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
  const { domain: innerDomain, numberOfLevels: innerNumberOfLevels } = innerFormula
  const { domain: marginalDomain, size: marginalSize, numberOfLevels: marginalNumberOfLevels } = marginalFormula

  const result = evaluateMarginalPure(
    innerPotential, innerDomain, innerNumberOfLevels, marginalDomain, marginalNumberOfLevels, marginalSize,
  )
  potentials[marginalFormula.id] = result
  return result
}

const evaluateEvidence = (evidenceFunction: EvidenceFunction, potentials: MaybeFastPotential[]): FastPotential => {
  // if no evidence is provided, then we can return the inner potential
  const result: number[] = Array(evidenceFunction.size).fill(1)
  let total = 0
  if (evidenceFunction.level == null) {
    potentials[evidenceFunction.id] = result.fill(1)
    total = result.length
  } else {
    result.forEach((_, i) => {
      result[i] = i === evidenceFunction.level ? 1 : 0
      total += result[i]
    })
  }
  const normalizedResult = result.map(x => x / total)
  potentials[evidenceFunction.id] = normalizedResult
  return normalizedResult
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
        return result
      }
      case FormulaType.EVIDENCE_FUNCTION: {
        const evidenceFunction = formula as EvidenceFunction
        const result: FastPotential = evaluateEvidence(evidenceFunction, potentials)
        return result
      }
      case FormulaType.UNIT:
        // Note, there is only one implementation of the unit potential function.
        return []
      case FormulaType.NODE_POTENTIAL: throw new Error(`The node potential function for node ${nodes[formulaId].name} was not provided`)
    }
  }
}
