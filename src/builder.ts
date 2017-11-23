/**
 * Adds a node to a Bayesian Network
 *
 * @param {Object} network - The Bayesian Network to add the node
 * @param {Object} node - The node to be added
 * @param {String} node.id - The node id
 * @param {String[]} node.parents - The ids of the node parents or empty array
 * @param {String[]} node.states - The states of the node
 * @param {Object} node.cpt - The node conditional probability table.
 * When the node has no parents, it's an object with keys = states and values = probabilities.
 * When the node has parents, it's an array of objects containing two properties: when and then.
 * The property when is an object with keys = parent id and values = parents state.
 * The property then is an object of the same shape as the case when the node has no parents.
 *
 * @returns {Object} Bayesian Network with node added
 */
export const addNode = (network, node) => {
  checkIfPropertiesAreValid(network, node);

  if (network.hasOwnProperty(node.id)) {
    throw new Error('This node is already added.');
  }

  return {
    ...network,
    [node.id]: node
  };
};

const checkIfPropertiesAreValid = (network, node) => {
  if (!node.id || typeof node.id !== 'string') {
    throw new Error('The node id is required and must be a string.');
  }

  if (!Array.isArray(node.parents)) {
    throw new Error('The node parents must be an array of strings.');
  }

  checkIfParentsExist(network, node.parents);

  if (!Array.isArray(node.states) || node.states.length === 0) {
    throw new Error('The node states must be an array with two or more strings.');
  }

  node.states.forEach(state => {
    if (typeof state !== 'string') {
      throw new Error('The node states must be an array with two or more strings.');
    }
  });

  if (node.parents.length === 0) {
    checkIfAllProbabilitiesArePresent(node.states, node.cpt);
  } else {
    // TODO: validate if all combinations are present and improve the
    // 'throws when node has parents and cpt is not valid' test.

    if (!Array.isArray(node.cpt)) {
      throw new Error('You must set the probabilities of all states of this node giving the combinations of its parents states.');
    }

    node.cpt.forEach(probs => {
      checkIfAllProbabilitiesArePresent(node.states, probs.then);
    });
  }
};

const checkIfParentsExist = (network, parents) => {
  parents.forEach(parentId => {
    if (typeof parentId !== 'string') {
      throw new Error('The node parents must be an array of strings.');
    }

    if (!network.hasOwnProperty(parentId)) {
      throw new Error('This node parent was not found.');
    }
  });
};

const checkIfAllProbabilitiesArePresent = (states, probabilities) => {
  states.forEach(state => {
    if (!probabilities || typeof probabilities[state] !== 'number') {
      throw new Error('You must set the probabilities of all states of this node.');
    }
  });
};