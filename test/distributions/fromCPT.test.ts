import * as expect from 'expect'

import { fromCPT } from '../../src/engines'

describe('fromCPT', () => {
  it('encodes the correct joint distribution without parents', () => {
    const dist = fromCPT('Foo', [], [['bar', 'baz']], { bar: 10, baz: 90 })
    const json = dist.toJSON()
    expect(json.numberOfHeadVariables).toEqual(1)
    expect(json.variableNames).toEqual(['Foo'])
    expect(json.variableLevels).toEqual([['bar', 'baz']])
    expect(json.potentialFunction).toEqual([0.1, 0.9])
  })
  it('encodes the correct joint distribution with parents', () => {
    const dist = fromCPT('Foo', ['animal', 'color'], [['bar', 'baz'], ['cat', 'dog'], ['black', 'white', 'brown']], [
      { when: { animal: 'cat', color: 'black' }, then: { bar: 10, baz: 90 } },
      { when: { animal: 'cat', color: 'white' }, then: { bar: 70, baz: 30 } },
      { when: { animal: 'dog', color: 'black' }, then: { bar: 80, baz: 20 } },
      { when: { animal: 'dog', color: 'white' }, then: { bar: 40, baz: 60 } },
      { when: { animal: 'dog', color: 'brown' }, then: { bar: 90, baz: 10 } },
    ])
    const json = dist.toJSON()
    expect(json.numberOfHeadVariables).toEqual(1)
    expect(json.variableNames).toEqual(['Foo', 'animal', 'color'])
    expect(json.variableLevels).toEqual([['bar', 'baz'], ['cat', 'dog'], ['black', 'white', 'brown']])
    expect(json.potentialFunction).toEqual([
      0.02, 0.18, 0.16, 0.04, 0.14, 0.06, 0.08, 0.12, 0, 0, 0.18, 0.02,
    ])
  })
})
