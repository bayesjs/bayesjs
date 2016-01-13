import equal from 'deep-equal';

// TODO: jsdoc all this
export const infer = (network, nodes, giving) => {
  const joint = buildJointDistribution(network);

  let filteredJoint = filterJointDistribution(joint, nodes);
  let probGiving = 1;

  if (giving) {
    filteredJoint = filterJointDistribution(filteredJoint, giving);
    probGiving = infer(network, giving);
  }

  return calculateProbabilities(network, filteredJoint) / probGiving;
};

const buildJointDistribution = network => {
  const joint = [];

  const makeCombinations = (nodes, acc = {}) => {
    if (nodes.length === 0) {
      joint.push(acc);
      return;
    }

    const node = nodes[0];
    const states = network[node].states;

    states.forEach(state => {
      makeCombinations(nodes.slice(1), {
        ...acc,
        [node]: state
      });
    });
  };

  makeCombinations(Object.keys(network));

  return joint;
};

const filterJointDistribution = (joint, nodes) => joint.filter(jointRow => {
  let remove = false;

  Object.keys(nodes).forEach(node => {
    if (jointRow[node] !== nodes[node]) {
      remove = true;
    }
  });

  return !remove;
});

const calculateProbabilities = (network, joint) => {
  const prob = joint.reduce((sum, jointRow) => {
    let lineProb = 1;

    Object.keys(jointRow).forEach(nodeId => {
      const node = network[nodeId];

      if (node.parents.length === 0) {
        lineProb *= node.cpt[jointRow[nodeId]];
      } else {
        const when = node.parents.reduce((acc, parent) => ({
          ...acc,
          [parent]: jointRow[parent]
        }), {});

        node.cpt.forEach(cptRow => {
          if (equal(cptRow.when, when)) {
            lineProb *= cptRow.then[jointRow[nodeId]];
          }
        });
      }
    });

    return sum + lineProb;
  }, 0);

  return prob;
};
