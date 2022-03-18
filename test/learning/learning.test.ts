
import { network } from '../../models/alarm'
import { InferenceEngine, FastPotential } from '../../src'
import { learnParameters } from '../../src/learning/learning'
import { restoreEngine } from '../../src/engines/util'
import { localDistributionPotentials } from '../../src/learning/objective-functions/util'
import { PairedObservation } from '../../src/learning/Observation'

function randomObservation (): Record<string, string> {
  const result: PairedObservation = {}
  const EARTHQUAKE = Math.random() > 0.99 ? 'T' : 'F'
  const BURGLARY = Math.random() > 0.95 ? 'T' : 'F'
  const ALARM = (result.EARTHQUAKE || result.BURGLARY) ? (Math.random() > 0.9 ? 'F' : 'T') : (Math.random() > 0.99 ? 'T' : 'F')
  const JOHN_CALLS = (result.ALARM) ? (Math.random() > 0.9 ? 'F' : 'T') : (Math.random() > 0.99 ? 'T' : 'F')
  const MARY_CALLS = (result.ALARM) ? (Math.random() > 0.7 ? 'F' : 'T') : (Math.random() > 0.95 ? 'T' : 'F')
  let r = Math.floor(Math.random() * 31) + 1
  if (r % 2) result.EARTHQUAKE = EARTHQUAKE
  r = Math.floor(r / 2)
  if (r % 2) result.BURGLARY = BURGLARY
  r = Math.floor(r / 2)
  if (r % 2) result.ALARM = ALARM
  r = Math.floor(r / 2)
  if (r % 2) result.JOHN_CALLS = JOHN_CALLS
  r = Math.floor(r / 2)
  if (r % 2) result.MARY_CALLS = MARY_CALLS
  return result
}

function randomDataSet (): PairedObservation[] {
  const size = 1 + Math.floor(Math.random() * 100)
  return Array(size).fill({}).map(() => randomObservation())
}

const data: Record<string, string>[] = randomDataSet()

describe('learnParameters', () => {
  const tol = 0.001
  const learningRate = 1
  const maxIterations = 100
  it('converges when a trial solution has negative potentials', () => {
    const engine = new InferenceEngine(network)
    const ds: Record<string, string>[] = [
      { EARTHQUAKE: 'F', BURGLARY: 'F', ALARM: 'F' },
      { BURGLARY: 'F', ALARM: 'F', MARY_CALLS: 'F' },
      { EARTHQUAKE: 'F', BURGLARY: 'F', JOHN_CALLS: 'F', MARY_CALLS: 'F' },
      { JOHN_CALLS: 'F' },
      { ALARM: 'F', MARY_CALLS: 'F' },
      { ALARM: 'F', JOHN_CALLS: 'F' },
      { EARTHQUAKE: 'F', MARY_CALLS: 'F' },
      { EARTHQUAKE: 'F', MARY_CALLS: 'T' },
      { EARTHQUAKE: 'F', BURGLARY: 'F', ALARM: 'F', MARY_CALLS: 'F' },
      { BURGLARY: 'F', ALARM: 'F' },
      { EARTHQUAKE: 'F', ALARM: 'F', MARY_CALLS: 'F' },
      { BURGLARY: 'F', ALARM: 'F', JOHN_CALLS: 'F', MARY_CALLS: 'F' },
      { EARTHQUAKE: 'F', ALARM: 'F' },
      { EARTHQUAKE: 'F', ALARM: 'F', MARY_CALLS: 'F' },
      {
        EARTHQUAKE: 'F',
        BURGLARY: 'F',
        ALARM: 'F',
        JOHN_CALLS: 'F',
        MARY_CALLS: 'F',
      },
      { BURGLARY: 'F', JOHN_CALLS: 'F' },
      { BURGLARY: 'F', JOHN_CALLS: 'F' },
      { EARTHQUAKE: 'F', BURGLARY: 'F', JOHN_CALLS: 'F' },
      { BURGLARY: 'F', ALARM: 'F' },
      { EARTHQUAKE: 'F', ALARM: 'F', JOHN_CALLS: 'F' },
      { ALARM: 'F', JOHN_CALLS: 'F', MARY_CALLS: 'F' },
      { EARTHQUAKE: 'F', BURGLARY: 'F', JOHN_CALLS: 'F' },
      {
        EARTHQUAKE: 'F',
        BURGLARY: 'F',
        ALARM: 'F',
        JOHN_CALLS: 'F',
        MARY_CALLS: 'F',
      },
      { BURGLARY: 'F' },
      { EARTHQUAKE: 'F', ALARM: 'F', JOHN_CALLS: 'F' },
      { JOHN_CALLS: 'F', MARY_CALLS: 'F' },
      { EARTHQUAKE: 'F', BURGLARY: 'F', ALARM: 'F', MARY_CALLS: 'F' },
      { JOHN_CALLS: 'F', MARY_CALLS: 'F' },
      { EARTHQUAKE: 'F', JOHN_CALLS: 'F' },
      { BURGLARY: 'F', ALARM: 'F', JOHN_CALLS: 'F' },
      { EARTHQUAKE: 'F', ALARM: 'F', MARY_CALLS: 'F' },
      { BURGLARY: 'F' },
      { EARTHQUAKE: 'F', JOHN_CALLS: 'F' },
      { EARTHQUAKE: 'F' },
      { EARTHQUAKE: 'F', ALARM: 'F', JOHN_CALLS: 'F' },
      { JOHN_CALLS: 'F', MARY_CALLS: 'F' },
      { EARTHQUAKE: 'F', JOHN_CALLS: 'F' },
      { BURGLARY: 'F', MARY_CALLS: 'F' },
      { ALARM: 'F' },
      { EARTHQUAKE: 'F', MARY_CALLS: 'F' },
      { BURGLARY: 'F', ALARM: 'F', JOHN_CALLS: 'F' },
      { EARTHQUAKE: 'F', JOHN_CALLS: 'F' },
      { EARTHQUAKE: 'F', BURGLARY: 'F', JOHN_CALLS: 'F' },
      { EARTHQUAKE: 'F', BURGLARY: 'F', JOHN_CALLS: 'F', MARY_CALLS: 'F' },
    ]
    const result = learnParameters(engine, ds, learningRate, maxIterations, tol)
    expect(result.converged).toEqual(true)
  })
  it('converges when the cubic interpolation does not have a real root', () => {
    const engine = new InferenceEngine(network)
    const ds: Record<string, string>[] =
    [
      { EARTHQUAKE: 'F', BURGLARY: 'F', JOHN_CALLS: 'F' },
      { EARTHQUAKE: 'F', BURGLARY: 'F', ALARM: 'F' },
    ]
    const result = learnParameters(engine, ds, learningRate, maxIterations, tol)
    expect(result.converged).toEqual(true)
  })
  it('converges when dataset contains no observations for a clique', () => {
    const ds: Record<string, string>[] = [{ MARY_CALLS: 'F' }, { JOHN_CALLS: 'F', MARY_CALLS: 'F' }, { JOHN_CALLS: 'F', MARY_CALLS: 'F' },
      { JOHN_CALLS: 'F', MARY_CALLS: 'F' }, { MARY_CALLS: 'F' }, { JOHN_CALLS: 'F', MARY_CALLS: 'F' },
      { JOHN_CALLS: 'F' }, { JOHN_CALLS: 'F' }, { MARY_CALLS: 'F' }, { JOHN_CALLS: 'F' }, { JOHN_CALLS: 'F' },
      { MARY_CALLS: 'F' }, { MARY_CALLS: 'F' }, { JOHN_CALLS: 'F' }, { MARY_CALLS: 'F' }, { JOHN_CALLS: 'T' },
      { MARY_CALLS: 'F' }, { MARY_CALLS: 'F' }, { JOHN_CALLS: 'F' }, { JOHN_CALLS: 'F' }, { MARY_CALLS: 'F' },
      { JOHN_CALLS: 'F', MARY_CALLS: 'T' }, { JOHN_CALLS: 'F', MARY_CALLS: 'F' }]
    const engine = new InferenceEngine(network)
    const result = learnParameters(engine, ds, learningRate, maxIterations, tol)
    expect(result.converged).toEqual(true)
  })
  it('converges when dataset contains no observations for a separator', () => {
    const ds: Record<string, string>[] = [
      { BURGLARY: 'F', MARY_CALLS: 'F' },
      { EARTHQUAKE: 'F', BURGLARY: 'F', JOHN_CALLS: 'F', MARY_CALLS: 'F' },
      { EARTHQUAKE: 'F', BURGLARY: 'F', JOHN_CALLS: 'F', MARY_CALLS: 'F' },
      { EARTHQUAKE: 'F', JOHN_CALLS: 'F', MARY_CALLS: 'F' },
      { EARTHQUAKE: 'F', MARY_CALLS: 'F' },
      { EARTHQUAKE: 'F', BURGLARY: 'F' },
      { BURGLARY: 'F', JOHN_CALLS: 'F', MARY_CALLS: 'F' },
      { BURGLARY: 'T', JOHN_CALLS: 'F' },
      { BURGLARY: 'F', JOHN_CALLS: 'F' },
      { EARTHQUAKE: 'F', BURGLARY: 'F', MARY_CALLS: 'F' },
      { EARTHQUAKE: 'F', BURGLARY: 'F', JOHN_CALLS: 'F' },
      { EARTHQUAKE: 'F', BURGLARY: 'F', JOHN_CALLS: 'F' },
      { EARTHQUAKE: 'F', BURGLARY: 'F', MARY_CALLS: 'F' },
      { EARTHQUAKE: 'F', MARY_CALLS: 'F' },
      { EARTHQUAKE: 'F', BURGLARY: 'F', JOHN_CALLS: 'F' },
      { EARTHQUAKE: 'F', MARY_CALLS: 'F' },
      { BURGLARY: 'F', JOHN_CALLS: 'T' },
      { BURGLARY: 'F', MARY_CALLS: 'F' },
      { JOHN_CALLS: 'F', MARY_CALLS: 'F' },
      { JOHN_CALLS: 'F' },
      { BURGLARY: 'F', JOHN_CALLS: 'F' },
      { MARY_CALLS: 'F' },
      { BURGLARY: 'F', JOHN_CALLS: 'F', MARY_CALLS: 'T' },
      { EARTHQUAKE: 'F', JOHN_CALLS: 'F', MARY_CALLS: 'F' },
    ]
    const engine = new InferenceEngine(network)
    const result = learnParameters(engine, ds, learningRate, maxIterations, tol)
    expect(result.converged).toEqual(true)
  })
  it('converges when dataset contains no observations for a root', () => {
    const ds: Record<string, string>[] = [
      { EARTHQUAKE: 'F', BURGLARY: 'F', ALARM: 'F' },
      { ALARM: 'F', MARY_CALLS: 'F' },
      { EARTHQUAKE: 'F', JOHN_CALLS: 'F', MARY_CALLS: 'F' },
      { JOHN_CALLS: 'F' },
      { ALARM: 'F', MARY_CALLS: 'F' },
      { ALARM: 'F', JOHN_CALLS: 'F' },
      { EARTHQUAKE: 'F', MARY_CALLS: 'F' },
      { EARTHQUAKE: 'F', MARY_CALLS: 'T' },
      { EARTHQUAKE: 'F', ALARM: 'F', MARY_CALLS: 'F' },
      { ALARM: 'F' },
      { EARTHQUAKE: 'F', ALARM: 'F', MARY_CALLS: 'F' },
      { ALARM: 'F', JOHN_CALLS: 'F', MARY_CALLS: 'F' },
      { EARTHQUAKE: 'F', ALARM: 'F' },
      { EARTHQUAKE: 'F', ALARM: 'F', MARY_CALLS: 'F' },
      {
        EARTHQUAKE: 'F',
        ALARM: 'F',
        JOHN_CALLS: 'F',
        MARY_CALLS: 'F',
      },
      { JOHN_CALLS: 'F' },
      { JOHN_CALLS: 'F' },
      { EARTHQUAKE: 'F', JOHN_CALLS: 'F' },
      { ALARM: 'F' },
      { EARTHQUAKE: 'F', ALARM: 'F', JOHN_CALLS: 'F' },
      { ALARM: 'F', JOHN_CALLS: 'F', MARY_CALLS: 'F' },
      { EARTHQUAKE: 'F', JOHN_CALLS: 'F' },
      {
        EARTHQUAKE: 'F',
        ALARM: 'F',
        JOHN_CALLS: 'F',
        MARY_CALLS: 'F',
      },
      { EARTHQUAKE: 'F', ALARM: 'F', JOHN_CALLS: 'F' },
      { JOHN_CALLS: 'F', MARY_CALLS: 'F' },
      { EARTHQUAKE: 'F', ALARM: 'F', MARY_CALLS: 'F' },
      { JOHN_CALLS: 'F', MARY_CALLS: 'F' },
      { EARTHQUAKE: 'F', JOHN_CALLS: 'F' },
      { BURGLARY: 'F', ALARM: 'F', JOHN_CALLS: 'F' },
      { EARTHQUAKE: 'F', ALARM: 'F', MARY_CALLS: 'F' },
      { BURGLARY: 'F' },
      { EARTHQUAKE: 'F', JOHN_CALLS: 'F' },
      { EARTHQUAKE: 'F' },
      { EARTHQUAKE: 'F', ALARM: 'F', JOHN_CALLS: 'F' },
      { JOHN_CALLS: 'F', MARY_CALLS: 'F' },
      { EARTHQUAKE: 'F', JOHN_CALLS: 'F' },
      { BURGLARY: 'F', MARY_CALLS: 'F' },
      { ALARM: 'F' },
      { EARTHQUAKE: 'F', MARY_CALLS: 'F' },
      { BURGLARY: 'F', ALARM: 'F', JOHN_CALLS: 'F' },
      { EARTHQUAKE: 'F', JOHN_CALLS: 'F' },
      { EARTHQUAKE: 'F', BURGLARY: 'F', JOHN_CALLS: 'F' },
      { EARTHQUAKE: 'F', BURGLARY: 'F', JOHN_CALLS: 'F', MARY_CALLS: 'F' },
    ]
    const engine = new InferenceEngine(network)
    const result = learnParameters(engine, ds, learningRate, maxIterations, tol)
    expect(result.converged).toEqual(true)
  })
  it('converges with singleton dataset', () => {
    const engine = new InferenceEngine(network)
    const result = learnParameters(engine, [data[0]], learningRate, maxIterations, tol)
    expect(result.converged).toEqual(true)
  })
  it('throws with empty dataset', () => {
    const engine = new InferenceEngine(network)
    expect(() => learnParameters(engine, [], learningRate, maxIterations, tol)).toThrowError()
  })
  it('throws with vacuous observations', () => {
    const engine = new InferenceEngine(network)
    expect(() => learnParameters(engine, [{}], learningRate, maxIterations, tol)).toThrowError()
  })
  // fit('converges with random dataset', () => {
  //   const engine = new InferenceEngine(network)
  //   const ds = data
  //   const result = learnParameters(engine, ds, learningRate, maxIterations, tol)
  //   const numberOfVariables = engine.getVariables().length
  //   const posteriors = engine.toJSON()._potentials.slice(0, numberOfVariables)
  //   expect(result.converged).toEqual(true)
  //   expect(posteriors.every(ps => (ps || []).every(x => !Number.isNaN(x)))).toEqual(true)
  //   expect(posteriors.every(ps => (ps || []).every(x => Number.isFinite(x)))).toEqual(true)
  //   expect(posteriors.every(ps => (ps || []).every(x => x > 0)))
  // })
})

describe('restoreEngine', () => {
  it('clears the cached potentials', () => {
    const engine = new InferenceEngine(network)
    // compute all the posterior joint distributions for the cliques of the junction tree
    engine.inferAll()
    const numberOfVariables = engine.getVariables().length
    const priors = engine.toJSON()._potentials.slice(0, numberOfVariables)
    restoreEngine(engine, priors, {})
    const cache = engine.toJSON()._potentials.slice(numberOfVariables)
    expect(cache.every(x => x == null)).toEqual(true)
  })
  it('sets the local distributions', () => {
    const engine = new InferenceEngine(network)
    const numberOfVariables = engine.getVariables().length
    const priors = engine.toJSON()._potentials.slice(0, numberOfVariables) as number[][]
    const randomPriors = priors.map(ps => ps.map(() => Math.random()))
    restoreEngine(engine, randomPriors, {})
    const updatedPriors = engine.toJSON()._potentials.slice(0, numberOfVariables) as number[][]
    expect(updatedPriors).toEqual(randomPriors)
  })
  it('sets evidence', () => {
    const engine = new InferenceEngine(network)
    engine.setEvidence({ ALARM: ['T'] })
    const numberOfVariables = engine.getVariables().length
    const priors = engine.toJSON()._potentials.slice(0, numberOfVariables) as number[][]
    restoreEngine(engine, priors, { EARTHQUAKE: ['T'] })
    // retracts alarm evidence
    expect(engine.hasEvidenceFor('ALARM')).toEqual(false)
    expect(engine.getEvidence('EARTHQUAKE')).toEqual(['T'])
    // resets earthquake evidence
    restoreEngine(engine, priors, { EARTHQUAKE: ['F'], ALARM: ['T'] })
    expect(engine.getEvidence('EARTHQUAKE')).toEqual(['F'])
    expect(engine.getEvidence('ALARM')).toEqual(['T'])
    restoreEngine(engine, priors, {})
    expect(engine.getAllEvidence()).toEqual({})
  })
})

function roundTo (x: number, precision: number) {
  return Number.parseFloat(x.toPrecision(precision))
}

function sumOfBlocks (potentials: FastPotential[], numbersOfHeadLevels: number[]): number[] {
  const result: number[] = []
  for (let i = 0; i < potentials.length; i++) {
    for (let jk = 0; jk < potentials[i].length; jk += numbersOfHeadLevels[i]) {
      const block = potentials[i].slice(jk, jk + numbersOfHeadLevels[i])
      result.push(roundTo(block.reduce((total, x) => x + total, 0), 4))
    }
  }
  return result
}

describe('localDistributionPotentials', () => {
  const engine = new InferenceEngine(network)
  describe('without conditioning to non-zero', () => {
    const locals = engine.getVariables().map(name => localDistributionPotentials(name, engine))
    const numbersOfHeadLevels = engine.getVariables().map(name => engine.getLevels(name).length)
    // this code removes any clique potentials that were computed by localDistributionPotentials, but
    // not by the inferAll().
    engine.setEvidence({ ALARM: ['F'] })
    engine.removeAllEvidence()
    it('has blocks that sum to unity', () => {
      const observed = sumOfBlocks(locals, numbersOfHeadLevels)
      const expected = observed.map(() => 1)
      expect(expected).toEqual(observed)
    })
    it('Respect the probabilistic inferences of the original potentials', () => {
      engine.inferAll()
      const numberOfVariables = engine.getVariables().length
      const expected = engine.toJSON()._potentials.slice(numberOfVariables).map(ps => ps?.map(p => roundTo(p, 6)))
      restoreEngine(engine, locals, {})
      engine.inferAll()
      engine.getVariables().map(name => localDistributionPotentials(name, engine))
      // this code removes any clique potentials that were computed by localDistributionPotentials, but
      // not by the inferAll().
      engine.setEvidence({ ALARM: ['F'] })
      engine.removeAllEvidence()
      engine.inferAll()
      const observed = engine.toJSON()._potentials.slice(numberOfVariables).map(ps => ps?.map(p => roundTo(p, 6)))
      expect(expected).toEqual(observed)
    })
  })
  describe('with conditioning to non-zero', () => {
    const locals = engine.getVariables().map(name => localDistributionPotentials(name, engine))
    const numbersOfHeadLevels = engine.getVariables().map(name => engine.getLevels(name).length)
    // this code removes any clique potentials that were computed by localDistributionPotentials, but
    // not by the inferAll().
    engine.setEvidence({ ALARM: ['F'] })
    engine.removeAllEvidence()
    it('has blocks that sum to unity', () => {
      const observed = sumOfBlocks(locals, numbersOfHeadLevels)
      const expected = observed.map(() => 1)
      expect(expected).toEqual(observed)
    })
    it('Respect the probabilistic inferences of the original potentials', () => {
      engine.inferAll()
      const numberOfVariables = engine.getVariables().length
      const expected = engine.toJSON()._potentials.slice(numberOfVariables).map(ps => ps?.map(p => roundTo(p, 6)))
      restoreEngine(engine, locals, {})
      engine.inferAll()
      engine.getVariables().map(name => localDistributionPotentials(name, engine))
      // this code removes any clique potentials that were computed by localDistributionPotentials, but
      // not by the inferAll().
      engine.setEvidence({ ALARM: ['F'] })
      engine.removeAllEvidence()
      engine.inferAll()
      const observed = engine.toJSON()._potentials.slice(numberOfVariables).map(ps => ps?.map(p => roundTo(p, 6)))
      expect(expected).toEqual(observed)
    })
  })
})
