import { NodeId, FormulaId } from './common'
import { FastNode } from './FastNode'
import { reduce, product } from 'ramda'

export enum FormulaType {
  MARGINAL,
  PRODUCT,
  NODE_POTENTIAL,
  EVIDENCE_FUNCTION,
  UNIT,
  REFERENCE
}

// This type represents the syntax for a well formed potential function.
// A potential is either the marginal of a potential wrt to some variables,
// the product of two or more potentials, the prior potential for a node,
// a (hard) evidence function, a unit potential, or a reference to another
// potential.
export type Formula = Marginal | Product | NodePotential | EvidenceFunction | Unit | Reference

// This class implements the AST expression for a unit potential.   Unit
// potentials are effectively scalar constants.
export class Unit {
  id = -1;
  kind = FormulaType.UNIT;
  domain: number[];
  numberOfLevels: number[];
  size: number;
  name: string;
  refrerencedBy: number[] = []

  constructor () {
    this.domain = []
    this.name = '1'
    this.size = 0
    this.numberOfLevels = []
  };
}

// This class implements the AST expression for a reference to
// another potential.   All properties of the reference are
// the same as the underlying potential.   To ensure well formedness
// you should use the "reference" smart constructor instead of calling
// this class's constructor directly.
export class Reference {
  id: number;
  kind: FormulaType = FormulaType.REFERENCE;
  formulaId: FormulaId;
  name: string;
  domain: NodeId[];
  numberOfLevels: number[];
  size: number;
  refrerencedBy: number[] = []

  constructor (id: FormulaId, formulas: Formula[]) {
    this.id = id
    this.domain = formulas[id].domain
    this.formulaId = id
    this.name = `ref(${id})`
    this.numberOfLevels = formulas[id].numberOfLevels
    this.size = formulas[id].size
  }
}

// A smart constructor for a reference to another potential.  This
// handles applying the unit simplification.
export const reference = (formulaId: FormulaId, formulas: Formula[]) => {
  const deref: Formula = formulas[formulaId]
  switch (deref.kind) {
    // case FormulaType.PRIOR_POTENTIAL
    case FormulaType.REFERENCE:
    case FormulaType.UNIT: return deref
    default: return new Reference(formulaId, formulas)
  }
}

// This class implements the Marginal data case for a potential
// expression.   You should use the "marginalize" smart constructor
// rather than calling this class's constructor directly.
export class Marginal {
  id = -1;
  kind: FormulaType = FormulaType.MARGINAL
  separator: NodeId[];
  potential: FormulaId;
  domain: NodeId[];
  marginalized: NodeId[];
  name: string;
  numberOfLevels: number[];
  size: number;
  refrerencedBy: number[] = []

  constructor (separator: NodeId[], formula: Formula) {
    this.separator = separator
    this.potential = formula.id
    const d: number[] = formula.domain
    this.domain = separator.filter(x => d.includes(x))
    this.marginalized = d.filter(x => !separator.includes(x))
    this.name = `Σ({${this.marginalized.map(x => x.toString()).join(',')}},${formula.kind === FormulaType.REFERENCE ? formula.name : `ref(${formula.id})`})`
    this.numberOfLevels = this.domain.map(y => formula.numberOfLevels[formula.domain.findIndex(x => x === y)])
    this.size = product(this.numberOfLevels)
  }
}

// A smart constructor for a marginalization of a potential.  This
// smart constructor handles the cases where marginalization is not
// required, as well as the case where marginalization produces a
// unit potential.
export const marginalize = (sepSet: NodeId[], potential: Formula, formulas: Formula[]) => {
  const dom = potential.domain
  const d: NodeId[] = sepSet.filter(x => dom.includes(x))
  if (d.length === 0) return new Unit()
  if (d.length === dom.length) return potential

  switch (potential.kind) {
    case FormulaType.MARGINAL: {
      return new Marginal(d, formulas[(potential as Marginal).potential])
    }
    case FormulaType.UNIT: return potential
    default: return new Marginal(d, potential)
  }
}

// This class represents the AST data case for the product of two or
// more (non-unital) potentials.  You should use the "mult" smart
// constructor instead of calling the constructor for this class
// directly.
export class Product {
  id = -1;
  kind: FormulaType = FormulaType.PRODUCT
  domain: number[];
  name: string;
  factorIds: FormulaId[];
  numberOfLevels: number[];
  size: number;
  refrerencedBy: number[] = []

  constructor (factors: Formula[]) {
    this.factorIds = factors.map(x => x.id)
    this.name = `𝚷(${factors.map(x => x.kind === FormulaType.REFERENCE ? x.name : `ref(${x.id})`).join(',')})`
    this.domain = [...new Set(reduce((acc: NodeId[], x: Formula) => ([...acc, ...x.domain])
      , [], factors))]
    this.numberOfLevels = this.domain.map(x => {
      const maybefactor = factors.find(factor => factor.domain.includes(x))
      if (!maybefactor) throw new Error(`Domain of product ${this.name} contains nodes which are not in its factors`)
      const factor = maybefactor as Formula
      return factor.numberOfLevels[factor.domain.findIndex(y => y === x)]
    })
    this.size = product(this.numberOfLevels)
  }
}

// A smart constructor for the product of two or more potentials.
// this constructor handles the simplifications where the
// collection is empty or contains only units, and when the
// product constists of a single non unital term.
export const mult = (formulas: Formula[]): Formula => {
  const fs = formulas.filter(x => x.kind !== FormulaType.UNIT)
  if (fs.length === 0) return new Unit()
  if (fs.length === 1) return formulas[0]
  return new Product(fs)
}

// This class represents an expression for a node's
// prior potential.
export class NodePotential {
  id: number;
  kind: FormulaType = FormulaType.NODE_POTENTIAL;
  nodeId: number;
  domain: number[];
  name: string;
  numberOfLevels: number[];
  size: number;
  refrerencedBy: number[] = []

  constructor (node: FastNode, parentLevels: string[][]) {
    this.id = node.id
    this.nodeId = node.id
    this.domain = [node.id, ...node.parents]
    this.name = `Φ(${node.id})`
    this.numberOfLevels = [node.levels.length, ...parentLevels.map(x => x.length)]
    this.size = product(this.numberOfLevels)
  }
}

export class EvidenceFunction {
  id = -1;
  kind = FormulaType.EVIDENCE_FUNCTION;
  nodeId: number;
  levels: number[] | null ;
  name: string;
  domain: number[];
  numberOfLevels: number[];
  size: number;
  refrerencedBy: number[] = []

  constructor (node: FastNode) {
    this.nodeId = node.id
    this.levels = null
    this.domain = [node.id]
    this.name = `ϵ(${node.id})`
    this.numberOfLevels = [node.levels.length]
    this.size = node.levels.length
  }
}

export function updateReferences (formulas: Formula[]): void {
  formulas.forEach(formula => {
    switch (formula.kind) {
      case FormulaType.EVIDENCE_FUNCTION: {
        const f = formula as EvidenceFunction
        formulas[f.nodeId].refrerencedBy.push(f.id)
        break
      }
      case FormulaType.MARGINAL:
      {
        const f = formula as Marginal
        formulas[f.potential].refrerencedBy.push(f.id)
        break
      }

      case FormulaType.PRODUCT: {
        const f = formula as Product
        f.factorIds.forEach(factorId => formulas[factorId].refrerencedBy.push(f.id))
        break
      }
      case FormulaType.REFERENCE: {
        const f = formula as Reference
        formulas[f.formulaId].refrerencedBy.push(f.id)
        break
      }
      case FormulaType.NODE_POTENTIAL:
      case FormulaType.UNIT:
    }
  })
}
