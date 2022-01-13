import { InferenceEngine } from '../../src'

const engine = new InferenceEngine(
  {
    A: { levels: ['1', '2', '3'], parents: [], potentialFunction: [10, 70, 20] },
    B: { levels: ['a', 'b', 'c'], parents: ['A'], potentialFunction: [0.1, 0.7, 0.2, 0.2, 0.5, 0.3, 0.1, 0.6, 0.3] },
    C: { levels: ['x', 'y', 'z'], parents: ['A'], potentialFunction: [10, 70, 20, 20, 50, 30, 10, 60, 30] },
    D: { levels: ['i', 'j', 'k'], parents: ['B', 'C'], potentialFunction: [0.6, 0.3, 0.1, 0.3, 0.4, 0.3, 0.1, 0.3, 0.6, 0.5, 0.4, 0.1, 0.2, 0.5, 0.3, 0.1, 0.4, 0.5, 0.4, 0.5, 0.1, 0.3, 0.4, 0.3, 0.1, 0.5, 0.4] },
  },
)

const toPrecision = (n: number, p = 4) => Number.parseFloat(n.toPrecision(p))

describe('inference on non-binary-distribution', () => {
  describe('without evidence', () => {
    it('infers the correct marginal for a variable with no parents', () => {
      expect(engine.infer({ A: ['1'] })).toEqual(0.10)
      expect(engine.infer({ A: ['2'] })).toEqual(0.70)
      expect(engine.infer({ A: ['3'] })).toEqual(0.20)
    })
    it('infers the correct marginal for a node with 1 parent', () => {
      expect(toPrecision(engine.infer({ B: ['a'] }))).toEqual(0.17)
      expect(toPrecision(engine.infer({ B: ['b'] }))).toEqual(0.54)
      expect(toPrecision(engine.infer({ B: ['c'] }))).toEqual(0.29)
    })
    it('infers the correct marginal for a node with 2 parents', () => {
      expect(toPrecision(engine.infer({ D: ['i'] }))).toEqual(0.2445)
      expect(toPrecision(engine.infer({ D: ['j'] }))).toEqual(0.4350)
      expect(toPrecision(engine.infer({ D: ['k'] }))).toEqual(0.3205)
    })
    it('infers the correct marginal for nodes from different cliques', () => {
      expect(toPrecision(engine.infer({ A: ['1'], D: ['i'] }))).toEqual(0.023)
      expect(toPrecision(engine.infer({ A: ['2'], D: ['j'] }))).toEqual(0.301)
      expect(toPrecision(engine.infer({ A: ['3'], D: ['k'] }))).toEqual(0.0668)
    })
    it('infers the correct cumulative marginal for a variable with no parents', () => {
      expect(toPrecision(engine.infer({ A: ['1', '2'] }))).toEqual(0.80)
      expect(toPrecision(engine.infer({ A: ['2', '3'] }))).toEqual(0.90)
      expect(toPrecision(engine.infer({ A: ['1', '3'] }))).toEqual(0.30)
    })
    it('infers the correct cumulative marginal for a node with 1 parent', () => {
      expect(toPrecision(engine.infer({ B: ['a', 'b'] }))).toEqual(0.71)
      expect(toPrecision(engine.infer({ B: ['b', 'c'] }))).toEqual(0.83)
      expect(toPrecision(engine.infer({ B: ['c', 'a'] }))).toEqual(0.46)
    })
    it('infers the correct cumulative marginal for a node with 2 parents', () => {
      expect(toPrecision(engine.infer({ D: ['i', 'j'] }))).toEqual(0.2445 + 0.4350)
      expect(toPrecision(engine.infer({ D: ['j', 'k'] }))).toEqual(0.7555)
      expect(toPrecision(engine.infer({ D: ['k', 'i'] }))).toEqual(0.3205 + 0.2445)
    })
    it('infers the correct cumulative marginal for nodes from different cliques', () => {
      expect(toPrecision(engine.infer({ A: ['1', '2'], D: ['i', 'j'] }))).toEqual(toPrecision(0.023 + 0.0452 + 0.1771 + 0.3010))
    })
    it('infers the correct cumulative marginal for nodes same cliques', () => {
      expect(toPrecision(engine.infer({ A: ['1', '2'], B: ['a', 'b'] }))).toEqual(toPrecision(0.01 + 0.07 + 0.14 + 0.35))
    })
  })
  describe('with hard evidence', () => {
    beforeAll(() => {
      engine.setEvidence({ A: ['2'] })
    })
    it('infers the correct marginal for a variable with no parents', () => {
      expect(engine.infer({ A: ['1'] })).toEqual(0.0)
      expect(engine.infer({ A: ['2'] })).toEqual(1)
      expect(engine.infer({ A: ['3'] })).toEqual(0)
    })
    it('infers the correct marginal for a  with 1 parent', () => {
      expect(toPrecision(engine.infer({ B: ['a'] }))).toEqual(0.2)
      expect(toPrecision(engine.infer({ B: ['b'] }))).toEqual(0.5)
      expect(toPrecision(engine.infer({ B: ['c'] }))).toEqual(0.3)
    })
    it('infers the correct marginal for a  with 2 parents', () => {
      expect(toPrecision(engine.infer({ D: ['i'] }))).toEqual(0.253)
      expect(toPrecision(engine.infer({ D: ['j'] }))).toEqual(0.430)
      expect(toPrecision(engine.infer({ D: ['k'] }))).toEqual(0.317)
    })
  })
  describe('with soft evidence', () => {
    beforeAll(() => {
      engine.setEvidence({ A: ['1', '2'] })
    })
    it('infers the correct marginal for a variable with no parents', () => {
      expect(toPrecision(engine.infer({ A: ['1'] }))).toEqual(0.125)
      expect(toPrecision(engine.infer({ A: ['2'] }))).toEqual(0.875)
      expect(engine.infer({ A: ['3'] })).toEqual(0)
    })
    it('infers the correct marginal for a  with 1 parent', () => {
      expect(toPrecision(engine.infer({ B: ['a'] }))).toEqual(0.1875)
      expect(toPrecision(engine.infer({ B: ['b'] }))).toEqual(0.525)
      expect(toPrecision(engine.infer({ B: ['c'] }))).toEqual(0.2875)
    })
    it('infers the correct marginal for a  with 2 parents', () => {
      expect(toPrecision(engine.infer({ D: ['i'] }))).toEqual(0.2501)
      expect(toPrecision(engine.infer({ D: ['j'] }))).toEqual(0.4327)
      expect(toPrecision(engine.infer({ D: ['k'] }))).toEqual(0.3171)
    })
  })
})
