import expect from 'expect';
import { addNode } from '../src/index';
import { rain, sprinkler, grassWet } from '../models/rain-sprinkler-grasswet';

import { infer } from "../src/junctionTree";

describe('addNode', () => {
  it('adds node', () => {
    const network = addNode({}, rain);

    expect(network[rain.id]).toBe(rain);
  });

  it('adds nodes with parents', () => {
    let network = {};

    network = addNode(network, rain);
    network = addNode(network, sprinkler);
    network = addNode(network, grassWet);

    expect(network[rain.id]).toBe(rain);
    expect(network[sprinkler.id]).toBe(sprinkler);
    expect(network[grassWet.id]).toBe(grassWet);
  });

  it('throws when adding node with invalid id', () => {
    expect(() => {
      addNode({}, {
        ...rain,
        id: undefined
      });
    }).toThrow(/node id is required and must be a string/);

    expect(() => {
      addNode({}, {
        ...rain,
        id: ''
      });
    }).toThrow(/node id is required and must be a string/);

    expect(() => {
      addNode({}, {
        ...rain,
        id: 1
      });
    }).toThrow(/node id is required and must be a string/);
  });

  it('throws when adding node with invalid parents', () => {
    expect(() => {
      addNode({}, {
        ...rain,
        parents: undefined
      });
    }).toThrow(/node parents must be an array of strings/);

    expect(() => {
      addNode({}, {
        ...rain,
        parents: 1
      });
    }).toThrow(/node parents must be an array of strings/);

    expect(() => {
      addNode({}, {
        ...rain,
        parents: [ 1 ]
      });
    }).toThrow(/node parents must be an array of strings/);
  });

  it('throws when adding node with invalid states', () => {
    expect(() => {
      addNode({}, {
        ...rain,
        states: undefined
      });
    }).toThrow(/node states must be an array with two or more strings/);

    expect(() => {
      addNode({}, {
        ...rain,
        states: []
      });
    }).toThrow(/node states must be an array with two or more strings/);

    expect(() => {
      addNode({}, {
        ...rain,
        states: [ 1 ]
      });
    }).toThrow(/node states must be an array with two or more strings/);

    expect(() => {
      addNode({}, {
        ...rain,
        states: 1
      });
    }).toThrow(/node states must be an array with two or more strings/);
  });

  it('throws when adding node twice', () => {
    expect(() => {
      let network = {};

      network = addNode(network, rain);
      network = addNode(network, rain);
    }).toThrow(/node is already added/);
  });

  it('throws when adding node with non existent parent', () => {
    expect(() => {
      addNode({}, sprinkler);
    }).toThrow(/node parent was not found/);
  });

  it('throws when node has no parents and cpt is not valid', () => {
    expect(() => {
      addNode({}, {
        ...rain,
        cpt: undefined
      });
    }).toThrow(/You must set the probabilities/);

    expect(() => {
      addNode({}, {
        ...rain,
        cpt: { 'T': 1 }
      });
    }).toThrow(/You must set the probabilities/);

    expect(() => {
      addNode({}, {
        ...rain,
        cpt: { 'T': 1, 'F': 'F' }
      });
    }).toThrow(/You must set the probabilities/);
  });

  it('throws when node has parents and cpt is not valid', () => {
    const network = addNode({}, rain);

    expect(() => {
      addNode(network, {
        ...sprinkler,
        cpt: undefined
      });
    }).toThrow(/You must set the probabilities/);
  });
});
