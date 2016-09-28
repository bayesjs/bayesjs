// @flow

import equal from 'deep-equal';

type CptWithoutParents = {
  [key: string]: number
};

type CptWithParentsItem = {
  when: { [key: string]: string },
  then: { [key: string]: number }
};

type CptWithParents = CptWithParentsItem[];

type Node = {
  id: string,
  states: string[],
  parents: string[],
  cpt: CptWithoutParents | CptWithParents
};

type Network = {
  [key: string]: Node
};

type Combinations = {
  [key: string]: string
};

export function infer(network: Network, nodes: Combinations, giving: ?Combinations): number {
  const joint: Combinations[] = buildJointDistribution(network);

  let filteredJoint: Combinations[] = filterJointDistribution(joint, nodes);
  let probGiving: number = 1;

  if (giving) {
    filteredJoint = filterJointDistribution(filteredJoint, giving);
    probGiving = infer(network, giving);
  }

  return calculateProbabilities(network, filteredJoint) / probGiving;
}

function buildJointDistribution(network: Network): Combinations[] {
  const joint: Combinations[] = [];

  makeCombinations(Object.keys(network));

  return joint;

  function makeCombinations(nodes: string[], acc: Combinations = {}): void {
    if (nodes.length === 0) {
      joint.push(acc);
      return;
    }

    const node: string = nodes[0];
    const states: string[] = network[node].states;

    states.forEach(state => {
      makeCombinations(nodes.slice(1), {
        ...acc,
        [node]: state
      });
    });
  }
}

function filterJointDistribution(joint: Combinations[], nodes: Combinations): Combinations[] {
  return joint.filter(jointRow => {
    let remove = false;

    Object.keys(nodes).forEach(node => {
      if (jointRow[node] !== nodes[node]) {
        remove = true;
      }
    });

    return !remove;
  });
}

function calculateProbabilities(network: Network, joint: Combinations[]): number {
  const prob = joint.reduce((sum, jointRow) => {
    let lineProb = 1;

    Object.keys(jointRow).forEach(nodeId => {
      const node = network[nodeId];
      const cpt = (node.cpt : any);

      if (node.parents.length === 0) {
        lineProb *= cpt[jointRow[nodeId]];
      } else {
        const when = node.parents.reduce((acc, parent) => ({
          ...acc,
          [parent]: jointRow[parent]
        }), {});

        cpt.forEach(cptRow => {
          if (equal(cptRow.when, when)) {
            lineProb *= cptRow.then[jointRow[nodeId]];
          }
        });
      }
    });

    return sum + lineProb;
  }, 0);

  return prob;
}
