import { FastPotential, combinationToIndex, indexToCombination } from './FastPotential'
import { product, uniq, sum, max } from 'ramda'
import { evaluateMarginalPure } from './evaluation'
import { ICptWithParents, ICptWithoutParents } from '../types'
import { commaSep } from './util'

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
      throw new Error(`Cannot construct joint distribution for ${commaSep(headVariables.map(x => x.name))}${parentVariables.length > 0 ? ` conditioned on ${commaSep(parentVariables.map(x => x.name))}.  ` : '.  '} ${reason}`)
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
      const expectedlength = product(this._variableLevels.map(x => x.length))
      if (potentialFunction.length !== expectedlength) throwErr(`Expecting the potential function to have ${expectedlength} elements but found ${potentialFunction.length}`)
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
   */
  hasParentVariable (name: string): boolean {
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

  getPotentials () {
    return [...this._potentialFunction]
  }

  setPotentials (potentials: FastPotential) {
    const numberOfLevels = this._variableLevels.map(x => x.length)
    if (potentials.length !== product(numberOfLevels)) { throw new Error('Cannot set the potentials for the distribution.   The provided array has the wrong number of elements.') }
    // verify that each block of a conditional distribution is non-zero
    const blocksize = product(numberOfLevels.slice(0, this._numberOfHeadVariables))
    let total = 0
    for (let i = 0; i < potentials.length; i += blocksize) {
      const subtotal = sum(potentials.slice(i, i + blocksize))
      if (subtotal === 0) throw new Error('Cannot set the potentials for the distribution.  The probabilities are undefined for some combinations of the parent varaibles')
      total += subtotal
    }
    this._potentialFunction = potentials.map(p => p / total)
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
   * @param event - a mapping from the head variables to an outcome level.   At least
   *   one level must be provided for each head variable.  When more than one level is
   *   provided, then the cumulative probability will be returned
   * @param evidence - a mapping from the parent variables to their hard evidence.
   *   At least one level must be provided for each parent variable.   When more than
   *   one level is provided, then the evidence is treated as soft evidence for that
   *   parent variable.
   * @returns the joint probability of observing the given event subject to the
   *   evidence.
   * @throws If the caller does not provide event level for each head variable
   *   or hard evidence for each parent variable then this function will throw
   *   an error.
  */
  infer (event: { [name: string]: string[] }, evidence?: {[name: string]: string[]}) {
    const headVariableNames = Object.keys(event)
    const parentVariableNames = Object.keys(evidence || {})

    if (headVariableNames.some(x => this._variableNames.indexOf(x) >= this._numberOfHeadVariables)) throw new Error('Cannot infer probability.   The event contains evidence for one or more parent variables')
    if (parentVariableNames.some(x => {
      const idx = this._variableNames.indexOf(x)
      return idx >= 0 && idx < this._numberOfHeadVariables
    })) throw new Error('Cannot infer probability.   The evidence contains events for one or more head variables')

    const validHeadVariableNames = uniq(headVariableNames.filter(x => this.hasHeadVariable(x)))
    const validParentVariableNames = uniq(parentVariableNames.filter(x => this.hasParentVariable(x)))

    if (validHeadVariableNames.length < this._numberOfHeadVariables) throw new Error('Cannot infer probability.  The event must contain levels for each head variable.')
    if (validParentVariableNames.length < this._variableNames.length - this._numberOfHeadVariables) throw new Error('Cannot infer probability.  You must provide evidence for each parent variable.')
    // NOTE: if the given parent or head variable names include variables that are not part of
    // the distribution, then we can assume that the result is conditionally independent of
    // of the levels of those variables, and ignore them.
    const levels: number[][] = this._variableNames.map((name, i) => {
      const ls = i < this._numberOfHeadVariables ? event[name] : evidence ? evidence[name] : []
      return uniq(ls).map(l => this._variableLevels[i].indexOf(l)).filter(x => x >= 0)
    })
    // if we have reached this point and any of the variables have no levels, then
    // only "invalid" levels were specified.   If the invalid values were specified
    // for head variables, then the probability will be exactly zero.   If they were
    // provided for any of the parent variables, then the probability will be undefined.
    // Throw an error to alert the caller of the ill formed request.
    if (levels.slice(0, this._numberOfHeadVariables).some(x => x.length === 0)) return 0
    if (levels.some(x => x.length === 0)) throw new Error('Cannot infer probability.  The evidence for each parent must contain at least one valid level')
    // All is good.   Compute the joint probability conditioned upon the
    // evidence.
    const numberOfLevels: number[] = this._variableLevels.map((x) => x.length)

    let acc = 0
    let total = 0
    // traverse the elements of the potential function.   For each
    // entry that matches the given event and evidence, then accumulate
    // the probability into q.   Keep a running total of all the
    // entries that match the evidence -- this will be needed as a
    // normalization factor.
    this._potentialFunction.forEach((p, i) => {
      const combos: number[] = indexToCombination(i, numberOfLevels)
      if (combos.every((lvlIdx, varIdx) => levels[varIdx].includes(lvlIdx))) { acc += p }
      if (
        combos.every(
          (lvlIdx, varIdx) =>
            varIdx < this._numberOfHeadVariables || levels[varIdx].includes(lvlIdx),
        )
      ) { total += p }
    })
    // If the number of parent variables is zero, then the total is the
    // join marginal distribution, and needs to be divided by q to obtain
    // the conditional.
    if (this._numberOfHeadVariables === this._variableNames.length) return acc
    else return acc / total
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
export function fromCPT (name: string, parentNames: string[], levels: string[][], cpt: ICptWithParents | ICptWithoutParents) {
  const throwErr = (reason: string) => { throw new Error(`Cannot create conditional distribution for variable ${name}.  ${reason}`) }
  if (Array.isArray(cpt)) {
    if (parentNames.length === 0) throwErr('It has no parent variables')
    if (!levels[0] || levels[0].length === 0) throwErr(`${name} has no levels`)
    parentNames.forEach((pname, i) => {
      const ls = levels[i + 1]
      if (!ls || ls.length === 0) throwErr(`${parentNames[i]} has no levels`)
    })
    const parents = parentNames.map((name, i) => ({ name, levels: levels[i + 1] }))
    const [headLevels, ...parentLevels] = levels

    const numberOfLevels: number[] = levels.map(xs => xs.length)
    const resultSize: number = product(numberOfLevels)
    const result = Array(resultSize).fill(0)
    let total = 0
    cpt.forEach((row, rowidx) => {
      // Construct the combination for each of thenetries in the row.
      const parentCombo: number[] = parentNames.map((pname, i) => {
        if (!row.when || !row.when[pname]) throwErr(`Row ${rowidx} does not have an entry for parent variable ${pname}.`)
        const lvl = row.when[pname]
        const lvlidx = parentLevels[i].indexOf(lvl)
        if (lvlidx < 0) throwErr(`${lvl} is not a valid level.`)
        return lvlidx
      })

      headLevels.forEach((level, i) => {
        const idx = combinationToIndex([i, ...parentCombo], numberOfLevels)
        if (!row.then || row.then[level] == null) throwErr(`Row ${rowidx} is missing an entry for the level ${level} of the head variable.`)
        const p = row.then[level]
        result[idx] = p
        total += row.then[level]
      })
    })
    const normalizedResult = result.map(x => x / total)
    return new Distribution([{ name, levels: headLevels }], parents, normalizedResult)
  } else {
    if (levels.length < 1 || levels[0].length === 0) throwErr('It has no levels')
    const [headLevels] = levels
    const v: {name: string; levels: string[]} = { name, levels: headLevels }
    const potentialFunction = Array(headLevels.length).fill(0)
    let total = 0
    Object.entries(cpt).forEach(([k, v]) => {
      if (v < 0) throwErr(`The probability for ${k} is less than zero.`)
      total += v
      const lvlIdx = headLevels.indexOf(k)
      if (lvlIdx < 0) throwErr(`${k} is not a valid level`)
      potentialFunction[headLevels.indexOf(k)] += v
    })
    if (total < 0) throwErr('At least one level must have a non-zero liklihood.')
    potentialFunction.forEach((p, i) => { potentialFunction[i] = p / total })
    return new Distribution([v], [], potentialFunction)
  }
}
