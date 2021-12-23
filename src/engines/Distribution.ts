import { FastPotential, combinationToIndex, indexToCombination } from './FastPotential'
import { product, uniq, sum, max, union } from 'ramda'
import { evaluateMarginalPure } from './evaluation'
import { ICptWithParents, ICptWithoutParents } from '../types'

/** A Distribution represents a joint distribution of one (trivially) or more
   * "head" variables, optionally conditioned upon one or more parent variables.
   */
export class Distribution {
  private _potentialFunction: FastPotential
  private _variableNames: string[]
  private _variableLevels: string[][]
  private _numberOfHeadVariables: number

  /** construct a new probability distribution for a collection
   * of head variables and parent variables, and an optional
   * potential function.   If no potential function is provided,
   * then the uniform distribution is assumed.
   * @param headVariables - the head variables over which the joint
   *   distribution will be constructed
   * @param parentVariables - the optional list of parent variables
   *   upon which the distribution will be conditionally dependent.
   * @param potentialFunction - an optional fast potential containing
   *   the liklihood of each outcome.
   */
  constructor (headVariables: {name: string; levels: string[]}[], parentVariables: {name: string; levels: string[]}[], potentialFunction?: FastPotential) {
    function throwErr (reason: string) {
      throw new Error('Cannot construct joint distribution over the given variables' + (parentVariables.length > 0) ? ' conditioned on the given parent variables.  ' : '.  ' + reason)
    }
    if (headVariables.length < 1) throwErr('you provided no head variables.')
    const distinctHeadVariableNames = [...new Set(headVariables.map(x => x.name))]
    const distinctParentVariableNames = [...new Set(parentVariables.map(x => x.name))]
    if (distinctHeadVariableNames.length < headVariables.length) throwErr('Head variables are not distinct.')
    if (distinctParentVariableNames.length < parentVariables.length) throwErr('Parent variables are not distinct.')
    if (distinctHeadVariableNames.some(x => distinctParentVariableNames.includes(x))) throwErr('Head variables cannot also be parent variables.')

    if (headVariables.some(x => x.levels.length < 1)) throwErr('You must provide a non-empty list of levels for each head variable')
    if (parentVariables.some(x => x.levels.length < 1)) throwErr('You must provide a non-empty list of levels for each head variable')

    // to avoid reorering the variables, we do not use the distinctHeadVariable or distinctParentVariable names.
    this._variableNames = []
    this._variableLevels = []
    headVariables.concat(parentVariables).forEach(x => {
      this._variableNames.push(x.name)
      this._variableLevels.push(uniq(x.levels))
    })
    this._numberOfHeadVariables = headVariables.length
    if (potentialFunction) {
      if (potentialFunction.length !== product(this._variableLevels.map(x => x.length))) throwErr('The potential function does not have enough elements.')
      this._potentialFunction = potentialFunction
    } else {
      const len = product(this._variableLevels.map(x => x.length))
      this._potentialFunction = Array(len).fill(1 / len)
    }
  }

  /** Test if the distribution has a head variable with the given name.
   * @param name: the name of the head variable to test
   */
  hasHeadVariable (name: string) {
    const idx = this._variableNames.findIndex(str => str === name)
    return idx >= 0 && idx < this._numberOfHeadVariables
  }

  /** Get a head variable given its name.
   * @param name: The variable to get from the distribution
   * @returns an object containing the name of the variable and
   *   its levels.
   * @throws: whenever the variable does not exist in the distribution
   *   this function will throw an error.   Call "hasHeadVariable" prior
   *   to calling this function to ensure that the variable exists.
   */
  getHeadVariable (name: string): {name: string; levels: string[]} {
    const idx = this._variableNames.findIndex(str => str === name)
    if (idx < 0) throw new Error('Cannot get head variable.   It is not a variable in the distribution.')
    if (idx >= this._numberOfHeadVariables) throw new Error('Cannot get head variable.   It is a parent variable in the distribution.')
    return {
      name, levels: this._variableLevels[idx],
    }
  }

  /** Get all the head variables from a distribution.
   * @returns an array of objects where each element provides the name of a head variable and
   *   its levels.
   */
  getHeadVariables (): {name: string; levels: string[]}[] {
    const result = []
    for (let idx = 0; idx < this._numberOfHeadVariables; idx++) {
      result.push({
        name: this._variableNames[idx], levels: this._variableLevels[idx],
      })
    }
    return result
  }

  /** Test if the distribution has a parent variable with the given name.
   * @param name: the name of the parent variable to test
   */ hasParentVariable (name: string): boolean {
    const idx = this._variableNames.findIndex(str => str === name)
    return idx >= this._numberOfHeadVariables
  }

  /** Get a parent variable given its name.
   * @param name: The variable to get from the distribution
   * @returns an object containing the name of the variable and
   *   its levels.
   * @throws: whenever the variable does not exist in the distribution
   *   this function will throw an error.   Call "hasParentVariable" prior
   *   to calling this function to ensure that the variable exists.
   */
  getParentVariable (name: string): {name: string; levels: string[]} {
    const idx = this._variableNames.findIndex(str => str === name)
    if (idx < 0) throw new Error('Cannot get parent variable.   It is not a variable in the distribution.')
    if (idx < this._numberOfHeadVariables) throw new Error('Cannot get parent variable.   It is a head variable in the distribution.')
    return {
      name, levels: this._variableLevels[idx],
    }
  }

  /** Get all the parent variables from a distribution.
   * @returns an array of objects where each element provides the name of a parent variable and
   *   its levels.
   */
  getParentVariables (): {name: string; levels: string[]}[] {
    if (this._numberOfHeadVariables === this._variableNames.length) return []
    const result = []
    for (let idx = this._numberOfHeadVariables; idx < this._variableLevels.length; idx++) {
      result.push({
        name: this._variableNames[idx], levels: this._variableLevels[idx],
      })
    }
    return result
  }

  /** Remove a variable from the distribution by marginalizing.
   * @param name - the name of the variable to remove
   * @throws If the variable being removed is the last head variable
   *   in the distribution, this function will throw an error.
   * NOTE: If the variable does not exist in either the head or
   *   parent variables, then the requested removal will have no
   *   effect.
   */
  removeVariable (name: string) {
    const hasHead = this.hasHeadVariable(name)
    const hasParent = this.hasParentVariable(name)
    if (hasHead && this._numberOfHeadVariables === 1) throw new Error(`Cannot remove variable ${name} from the distribution.   It is the only head variable.`)
    // if the variable is either a head or parent, then update the distribution,
    // otherwise, ignore the requested removal.
    if (hasHead || hasParent) {
      const ls = this._variableLevels.map(x => x.length)
      const dom = [...Array(this._variableLevels.length).keys()]
      const idx = this._variableNames.indexOf(name)
      const newDom = dom.filter((_, i) => i !== idx)
      const newLs = ls.filter((_, i) => i !== idx)
      this._numberOfHeadVariables -= hasHead ? 1 : 0
      this._variableLevels.splice(idx, 1)
      this._variableNames.splice(idx, 1)
      this._potentialFunction = evaluateMarginalPure(this._potentialFunction, dom, ls, newDom, newLs, product(newLs))
    }
  }

  /** Remove a level from a variable in the given distribution.
   * @param name - the name of the variable from which the level will be removed
   * @param level - the level to remove from the variable
   * @throws - if the level is the last level for the variable, this function
   *   will throw an error.
   * NOTE: if the variable or level do not exist, then this function will
   *   have no effect, otherwise, the level will be removed and the potential
   *   function normalized to ensure that it still sums to unity.
   */
  removeLevel (name: string, level: string) {
    const idx = this._variableNames.indexOf(name)
    const oldNumberOfLevels: number[] = this._variableLevels.map(x => x.length)

    if (idx > 0) {
      const lidx = this._variableLevels[idx].indexOf(level)
      if (lidx > 0) {
        const newNumberOfLevels = oldNumberOfLevels.map((l, i) => i === idx ? l - 1 : l)
        const result: number[] = Array(product(newNumberOfLevels)).fill(0)

        let total = 0
        this._potentialFunction.forEach((v, i) => {
          const combo = indexToCombination(i, oldNumberOfLevels)
          if (combo[idx] !== lidx) {
            total += v
            if (combo[idx] > lidx) {
              combo[idx] = combo[idx] - 1
            }
            result[combinationToIndex(combo, newNumberOfLevels)] = v
          }
        })
        if (total === 0) throw new Error('Cannot remove the specified level.  It would make the distribution inconsistent')
        this._potentialFunction = result.map(p => p / total)
        this._variableLevels[idx].splice(lidx, 1)
      }
    }
  }

  /** Rename a variable in the probability distribution.  This function
   * has no effect on the probability distribution.
   * @param oldName: The old name of the variable
   * @param newName: The new name for the variable
   * @throws: if the old variable name does not exist, or if the new
   *   variable name already exists, then this function will throw an
   *   error.
   */
  renameVariable (oldName: string, newName: string) {
    const oldIdx = this._variableNames.indexOf(oldName)
    const newIdx = this._variableNames.indexOf(newName)
    if (oldIdx < 0) throw new Error(`Cannot rename variable ${oldName} to ${newName}.  It does not exist`)
    if (newIdx >= 0) throw new Error(`Cannot rename variable ${oldName} to ${newName}.  A variable with the new name already exists`)
    this._variableNames[oldIdx] = newName
  }

  /** Rename a level of a variable in the given distribution.  This function
   * has no effect on the probability distribution.
   * @param name: The name of the variable
   * @param oldLevel: The old level
   * @param newLevel: The new level
   * @throws: if the variable does not exist, the old level does not exist or if the new
   *   level name already exists, then this function will throw an
   *   error.
   */
  renameLevel (name: string, oldLevel: string, newLevel: string) {
    const Idx = this._variableNames.indexOf(name)
    if (Idx < 0) throw new Error(`Cannot rename level ${oldLevel} to ${newLevel} of variable ${name}.  The variable does not exist`)
    const oldIdx = this._variableLevels[Idx].indexOf(oldLevel)
    const newIdx = this._variableLevels[Idx].indexOf(newLevel)
    if (oldIdx < 0) throw new Error(`Cannot rename level ${oldLevel} to ${newLevel} of variable ${name}.  The old level does not exist`)
    if (newIdx >= 0) throw new Error(`Cannot rename level ${oldLevel} to ${newLevel} of variable ${name}.  The new level already exists`)
    this._variableLevels[Idx][oldIdx] = newLevel
  }

  /** Add a head variable to distribution.  This function will add the
   * variable in such a way that the marginal distribution of the
   * variable will be uniform, and the removal of the variable recovers
   * the original potential function.
   * @param name: The name of the variable
   * @param levels: A non-empty list of levels for the variable
   * @throws: if a variable with the name already exists, or if the
   *   list of levels is empty, this function will throw an error.
   */
  addHeadVariable (name: string, levels: string[]) {
    const Idx = this._variableNames.indexOf(name)
    if (Idx > 0) throw new Error(`Cannot add variable ${name}.  A variable with that name already exists`)
    const distinctLevels = uniq(levels)
    if (distinctLevels.length === 0) throw new Error(`Cannot add variable ${name}.  It has no levels`)

    const variableNames = [...this._variableNames.slice(0, this._numberOfHeadVariables), name, ...this._variableNames.slice(this._numberOfHeadVariables)]
    const variableLevels = [...this._variableLevels.slice(0, this._numberOfHeadVariables), levels, ...this._variableLevels.slice(this._numberOfHeadVariables)]
    const potentialFunction = Array(product(variableLevels.map(x => x.length))).fill(0)

    const oldNumberOfLevels = this._variableLevels.map(x => x.length)
    const newNumberOfLevels = variableLevels.map(x => x.length)
    this._potentialFunction.forEach((v, i) => {
      const oldCombos = indexToCombination(i, oldNumberOfLevels)
      levels.forEach((_, j) => {
        const newCombo = [...oldCombos.slice(0, this._numberOfHeadVariables), j, ...oldCombos.slice(this._numberOfHeadVariables)]
        potentialFunction[combinationToIndex(newCombo, newNumberOfLevels)] = v / levels.length
      })
    })

    this._variableNames = variableNames
    this._variableLevels = variableLevels
    this._numberOfHeadVariables += 1
    this._potentialFunction = potentialFunction
  }

  /** Add a parent variable to distribution.  This function will add the
   * variable in such a way that the marginal distribution of the
   * variable will be uniform, and the removal of the variable recovers
   * the original potential function.
   * @param name: The name of the variable
   * @param levels: A non-empty list of levels for the variable
   * @throws: if a variable with the name already exists, or if the
   *   list of levels is empty, this function will throw an error.
   */
  addParentVariable (name: string, levels: string[]) {
    const Idx = this._variableNames.indexOf(name)
    if (Idx > 0) throw new Error(`Cannot add variable ${name}.  A variable with that name already exists`)
    const distinctLevels = uniq(levels)
    if (distinctLevels.length === 0) throw new Error(`Cannot add variable ${name}.  It has no levels`)

    const variableNames = [...this._variableNames, name]
    const variableLevels = [...this._variableLevels, levels]
    const potentialFunction = Array(product(variableLevels.map(x => x.length))).fill(0)

    const oldNumberOfLevels = this._variableLevels.map(x => x.length)
    const newNumberOfLevels = variableLevels.map(x => x.length)
    this._potentialFunction.forEach((v, i) => {
      const oldCombos = indexToCombination(i, oldNumberOfLevels)
      levels.forEach((_, j) => {
        const newCombo = [...oldCombos, j]
        potentialFunction[combinationToIndex(newCombo, newNumberOfLevels)] = v / levels.length
      })
    })

    this._variableNames = variableNames
    this._variableLevels = variableLevels
    this._potentialFunction = potentialFunction
  }

  /** Add a level to a variable.  The potential assigned to any
   * effect or event having the new level will be diminishingly
   * small.
   * @param name: The name of the variable
   * @param level: the new level to add to the distribution
   * @throws: if a variable with the name does not exist, or if the
   *   level already exists, this function will throw an error.
   */
  addLevel (name: string, level: string) {
    const Idx = this._variableNames.indexOf(name)
    if (Idx < 0) throw new Error(`Cannot add level ${level} to variable ${name}.  A variable with that name does not exist`)
    const levelIdx = this._variableLevels[Idx].indexOf(level)
    if (levelIdx > 0) throw new Error(`Cannot add level ${level} to variable ${name}.  That level already exists`)

    const variableLevels = [...this._variableLevels]
    variableLevels[Idx] = [...this._variableLevels[Idx], level]
    const potentialFunction = Array(product(variableLevels.map(x => x.length))).fill(1E-9)

    const oldNumberOfLevels = this._variableLevels.map(x => x.length)
    const newNumberOfLevels = variableLevels.map(x => x.length)
    this._potentialFunction.forEach((v, i) => {
      const oldCombos = indexToCombination(i, oldNumberOfLevels)
      const newIndex = combinationToIndex(oldCombos, newNumberOfLevels)
      potentialFunction[newIndex] = v
    })
    const total = sum(potentialFunction)

    this._variableLevels = variableLevels
    this._potentialFunction = potentialFunction.map(p => p / total)
  }

  /** Infer the probability of an event conditioned upon hard evidence for its
   * parent variables.
   * @param event - a mapping from the head variables to an outcome level
   * @param evidence - a mapping from the parent variables to their hard evidence.
   * @returns the joint probability of observing the given event subject to the
   *   hard evidence.
   * @throws If the caller does not provide event level for each head variable
   *   or hard evidence for each parent variable then this function will throw
   *   an error.
  */
  infer (event: { [name: string]: string }, evidence?: {[name: string]: string}) {
    const headVariableNames = Object.keys(event)
    const parentVariableNames = Object.keys(evidence || {})
    const validHeadVariableNames = uniq(headVariableNames.filter(x => this.hasHeadVariable(x)))
    const validParentVariableNames = uniq(parentVariableNames.filter(x => this.hasParentVariable(x)))

    if (validHeadVariableNames.length < this._numberOfHeadVariables) throw new Error('Cannot infer probability.  The event must contain levels for each head variable.')
    if (validParentVariableNames.length < this._variableNames.length - this._numberOfHeadVariables) throw new Error('Cannot infer probability.  You must provide evidence for each parent variable.')
    if (parentVariableNames.length > validParentVariableNames.length) return 0
    if (headVariableNames.length > validHeadVariableNames.length) return 0

    const combo = this._variableNames.map((name, i) => {
      const level: string = i < this._numberOfHeadVariables ? event[name] : evidence ? evidence[name] : ''
      return this._variableLevels[i].findIndex(x => x === level)
    })
    // if any of the variables are provided a level that doesn't exist on the variable, then
    // we don't need to look up a value in the potential function.   The probability is zero.
    if (combo.some(i => i < 0)) return 0
    const numberOfLevels = this._variableLevels.map(xs => xs.length)
    const idx = combinationToIndex(combo, numberOfLevels)
    const p: number = this._potentialFunction[idx]
    if (validParentVariableNames.length > 0) {
      const desiredParentValues = combo.slice(this._numberOfHeadVariables)
      const qs = this._potentialFunction.filter((v, i) => {
        const parentValues = indexToCombination(i, numberOfLevels).slice(this._numberOfHeadVariables)
        return parentValues.every((v, i) => v === desiredParentValues[i])
      })
      const q = sum(qs)
      if (q === 0) throw new Error('Cannot infer conditional probability.   The marginal probability of the evidence is zero.')
      return p / q
    } else {
      return p
    }
  }

  // This is a back door for obtaining all the private collections in the distribution.
  // This function has been provided to aid in writing additonal tests and for persisting
  // distributions across instances.
  toJSON () {
    return {
      potentialFunction: this._potentialFunction,
      variableLevels: this._variableLevels,
      variableNames: this._variableNames,
      numberOfHeadVariables: this._numberOfHeadVariables,
    }
  }

  // Create a string representation of the CPT for the distribution
  describe () {
    const potentialFunction = [...this._potentialFunction]
    const numberOfLevels = this._variableLevels.map(x => x.length)
    // if this is a conditional distribution, preprocess the potentials to get the
    // conditional probabilities
    let marginal: number[] = []
    const marginalNumberOfLevels = numberOfLevels.slice(this._numberOfHeadVariables)
    if (this._numberOfHeadVariables < this._variableNames.length) {
      const dom = [...Array(this._variableNames.length).keys()]
      const marginalDom = dom.slice(this._numberOfHeadVariables)
      marginal = evaluateMarginalPure(potentialFunction, dom, numberOfLevels, marginalDom, marginalNumberOfLevels, product(marginalNumberOfLevels))
    }

    const columnWidths = this._variableNames.map((name, i) => [name, ...this._variableLevels[i]].reduce((acc, str) => max(acc, str.length), 0))

    const header = this._variableNames.map((name, i) =>
      (i === this._numberOfHeadVariables ? ' | ' : '') + name.padStart(columnWidths[i], ' ')).join(' ') + ' || Probability\n'
    const hsep = ''.padStart(header.length, '-') + '\n'

    const rows = potentialFunction.map((v, i) => {
      const combo = indexToCombination(i, numberOfLevels)
      const headvars = combo.slice(0, this._numberOfHeadVariables)
      const parentvars = combo.slice(this._numberOfHeadVariables)
      const marginalIdx = combinationToIndex(parentvars, marginalNumberOfLevels)
      const value = (marginal.length > 0) ? v / marginal[marginalIdx] : v
      const sep = (headvars.every(x => x === 0)) ? hsep : ''
      const row = combo.map((levelIdx, variableIdx) =>
        (variableIdx === this._numberOfHeadVariables ? ' | ' : '') + this._variableLevels[variableIdx][levelIdx].padStart(columnWidths[variableIdx], ' ')).join(' ') + ' || ' + value.toExponential(4)
      return sep + row
    }).join('\n')
    return header + rows
  }
}

// This function is designed to support legacy ICPT interface for
// specifying a probability distribution.
export function fromCPT (name: string, cpt: ICptWithParents | ICptWithoutParents) {
  if (Array.isArray(cpt)) {
    // The CPT has parents
    const parentNames = cpt.reduce((acc: string[], row) => union(acc, Object.keys(row.when)), [])
    const parentLevels: string[][] = parentNames.map(pname =>
      cpt.reduce((acc: string[], row) => {
        if (row.when[pname] === undefined) throw new Error(`Cannot create distribution for variable ${name}.  The rows of the cpt are missing entries for ${pname}.`)
        if (acc.includes(row.when[pname])) return acc
        return [...acc, row.when[pname]]
      }, []),
    )
    if (parentNames.length === 0) throw new Error(`Cannot create conditional distribution for variable ${name}.   It has no parent variables`)
    parentLevels.forEach((ls, i) => {
      if (ls.length === 0) throw new Error(`Cannot create conditional distribution for variable ${name}.   ${parentNames[i]} has no levels`)
    })
    const parents = parentNames.map((name, i) => ({ name, levels: parentLevels[i] }))

    const headLevels: string[] = cpt.reduce((acc: string[], row) => union(acc, Object.keys(row.then)), [])
    if (headLevels.length === 0) throw new Error(`Cannot create conditional distribution for variable ${name}.   The head variable has no levels`)

    const numberOfLevels: number[] = [headLevels.length, ...parentLevels.map(x => x.length)]
    const resultSize: number = product(numberOfLevels)
    const result = Array(resultSize).fill(0)
    let total = 0
    cpt.forEach(row => {
      const parentCombo: number[] = parentNames.map((pname, variableIdx) => parentLevels[variableIdx].indexOf(row.when[pname]))
      headLevels.forEach((level, i) => {
        const idx = combinationToIndex([i, ...parentCombo], numberOfLevels)
        result[idx] = row.then[level] || 0
        total += row.then[level]
      })
    })
    const normalizedResult = result.map(x => x / total)
    return new Distribution([{ name, levels: headLevels }], parents, normalizedResult)
  } else {
    // the cpt has no parents.
    const levels = uniq(Object.keys(cpt))
    if (levels.length === 0) throw new Error(`Cannot create distribution for variable ${name}.  It has no levels`)
    const v: {name: string; levels: string[]} = { name, levels }
    const potentialFunction = Array(levels.length).fill(0)
    let total = 0
    Object.entries(cpt).forEach(([k, v]) => {
      if (v < 0) throw new Error(`Cannot create distribution for variable ${name}.  The probability for ${k} is less than zero.`)
      total += v
      potentialFunction[levels.indexOf(k)] += v
    })
    if (total < 0) throw new Error(`Cannot create distribution for variable ${name}.  At least one level must have a non-zero liklihood.`)
    potentialFunction.forEach((p, i) => { potentialFunction[i] = p / total })
    return new Distribution([v], [], potentialFunction)
  }
}
