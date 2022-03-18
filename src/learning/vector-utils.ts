import { FastPotential } from '..'
import { sum } from 'ramda'

export const CUBEROOTEPS = Math.pow(Number.EPSILON, 1 / 3)
export const SQRTEPS = Math.sqrt(Number.EPSILON)

/** Compute the l2 norm (magnitude) of a parameter vector
 * @param potentials: The elements of the ascent direction, arranged
 *    as a 2 dimensional array where the first index is the variable
 *    and the second index encodes the levels of the variable and
 *    its parents.
 */
export function norm2 (potentials: FastPotential[]): number {
  return Math.sqrt(sum(potentials.map(ps => sum(ps.map(p => p * p)))))
}

/** Compute the condition number for a Hessian matrix.   Larger
* values for the condition number indicate that the matrix
* can be inverted safely, while smaller numbers indicate
* that matrix inversion may be subject to numerical errors.
* @param Hessian - the Hessian matrix for the objective function.
*   since the Hessian is a diagonal matrix, we store only
*   the on-diagonal elements, using the same indexing scheme
*   as for fast potentials.
* @return the condition number and the maximum and minimum
*   on diagonal elements of the Hessian.
*/
export function conditionNumber (hessian: FastPotential[]): { number: number; max: number; min: number } {
  let mx = 0
  let mn = Infinity
  hessian.forEach(hs => hs.forEach(h => {
    mx = Math.max(mx, Math.abs(h))
    mn = Math.min(mn, Math.abs(h))
  }))
  return {
    number: mn / mx,
    max: mx,
    min: mn,
  }
}

/** Given a Hessian matrix, determine if it is ill conditioned.   If it is
 * return the quasi-Newton approximation of the Hessian, otherwise return
 * the original Hessian. As a side effect, this functional also returns
 * the condition number and mu, the quasi-Newton parameter.
 * @param hessian - The elements of the diagonal of the Hessian matrix,
 *   indexed by variable, and then level index.   We are justified in this
 *   representation because the Hessian matrix will always be diagonal
 *   for this objective function.
 */
export function approximateHessian (hessian: FastPotential[]): { hessian: FastPotential[]; conditionNumber: number; mu: number} {
  const { number, max, min } = conditionNumber(hessian)
  if (number > SQRTEPS) {
    // If the matrix is safely negative definite, then return the
    // original matrix
    return {
      hessian,
      conditionNumber: number,
      mu: 0,
    }
  } else {
    // otherwise, add a small amount to each diagonal element of
    // the matrix so that it is well conditioned.
    const mu = 2 * (max - min) * SQRTEPS - min
    return {
      hessian: hessian.map((hs) => hs.map(h => h - mu)),
      conditionNumber: number,
      mu,
    }
  }
}

/** Compute the ascent direction for a given tower of derivatives of
 * the objective function.   If the Hessian is safely negative
 * definite, then return the Newton direction, otherwise return
 * the quasi-Newton direction.   As a side effect, return the
 * condition number, and the quasi-Newton parameter, mu.
 * @param tower: The tower of derivatives for the objective function
 * @param numbersOfHeadLevels: The number of levels for each
 *   variable in the Bayes network.
 * */
export function ascentDirection (gradient: FastPotential[], hessian: FastPotential[]): FastPotential[] {
  const hessianInv = hessian.map(hs => hs.map(h => 1 / h))

  // Compute the ascent direction.
  const direction = hessianInv.map((hs, i) => hs.map((h, jk) =>
    h * gradient[i][jk]),
  )

  return direction
}

/** Compute the lagrangian multipliers for a given tower of derivatives of
 * the objective function.   If the Hessian is safely negative
 * definite, then return the Newton direction, otherwise return
 * the quasi-Newton direction.
 * @param gradient: the unconditioned gradient.
 * @param hessian: the unconditioned hessian
 * @param numberOfHeadLevels: the number of levels of each head variable in each distirbution in the Bayes network
 * */
export function LagrangianMultipliers (gradient: FastPotential[], hessian: FastPotential[], numbersOfHeadLevels: number[]): FastPotential[] {
  const gammas: number[][] = []
  const hessianInv = hessian.map(hs => hs.map(h => 1 / h))

  // Compute the Lagragian multipliers.  These parameters ensure that
  // the sum of the CPT entries over each block of a CPT sum to unity.
  gradient.forEach((grad, i) => {
    const hess = hessianInv[i]
    const gs: number[] = []
    const n = numbersOfHeadLevels[i]
    for (let jk = 0; jk < grad.length; jk += n) {
      const gslice = grad.slice(jk, jk + n)
      const hslice = hess.slice(jk, jk + n)
      const numerator = gslice.reduce((acc, g, k) => acc + g * hslice[k], 0)
      const denominator = sum(hslice)
      gs.push(numerator / denominator)
    }
    gammas.push(gs)
  })

  return gammas
}
