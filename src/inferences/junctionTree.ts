import { 
  isEqual, 
  intersection, 
  cloneDeep,
  sum,
  isUndefined,
  maxBy,
  minBy,
} from 'lodash';
import { 
  INetwork, 
  INode, 
  INodeList, 
  ICombinations, 
  IClique, 
  IInfer, 
  ISepSet,
  ICliquePotentialItem,
  ICptWithParents,
  IEdge,
  IGraph
} from '../types/index';
import hash from 'object-hash';
import { 
  buildMoralGraph, 
  buildTriangulatedGraph 
} from '../graphs/index';
import { buildCombinations, flager } from '../utils/index';
import { buildCliqueGraph } from '../graphs/cliqueGraph';

const wmJT = new WeakMap();
const wmKey = new WeakMap();
const map = new Map();

export const infer: IInfer = (network: INetwork, nodes?: ICombinations, given?: ICombinations): number => {
  // console.log({ nodes, given });
  const key = getKeyNetwork(network);
  
  let cachedJT2 = map.get(key);
  
  if (cachedJT2 === undefined) {
    map.clear();
    cachedJT2 = createCliquesInfo(network);
    map.set(key, cachedJT2);  
  }
  const { emptyCliques, sepSets, junctionTree } = cachedJT2;
  const cliques = propagationCliques(emptyCliques, network, junctionTree, sepSets, given);

  // TODO: considerar P(A,B,C), por enquanto só P(A)
  return getResult(cliques, nodes);
};

const filterPotentialsByNodes = (potentials: ICliquePotentialItem[], nodes: ICombinations): ICliquePotentialItem[] => {
  return potentials.reduce((acc, potential) => 
    checkPotentialByNodes(potential, nodes) ? [ ...acc, potential ] : acc 
  , []);
}

const checkPotentialByNodes = (potential: ICliquePotentialItem, nodes: ICombinations): boolean => {
  const { when, then } = potential;
  const whenNodeIds = Object.keys(when);
  const nodeIds = Object.keys(nodes);

  return whenNodeIds.every(whenNodeId => {
    const whenValue = when[whenNodeId];
    const nodeValue = nodes[whenNodeId];

    return isUndefined(nodeValue) || whenValue === nodeValue;
  });
}

const filterCliquesByNodes = (cliques: IClique[], nodes?: ICombinations) => {
  const nodesToInfer = Object.keys(nodes);

  return cliques.filter(clique => 
    clique.clique.some(nodeId => 
      nodesToInfer.some(nodeToInfer => 
        nodeId === nodeToInfer
      )
    )
  );
};

const getCliqueByLength = minOrMax => (cliques: IClique[]) => 
  minOrMax(cliques, ({ clique }) => clique.length); 

const getMinimalCliqueLength = getCliqueByLength(minBy);
const getMaximalCliqueLength = getCliqueByLength(maxBy);

const getResult = (cliques: IClique[], nodes?: ICombinations) => {
  const cliquesNode = filterCliquesByNodes(cliques, nodes);
  const clique = getMaximalCliqueLength(cliquesNode);
  const potentialsFiltred = filterPotentialsByNodes(clique.potentials, nodes)
    .map(x => x.then);

  return sum(potentialsFiltred);
}

const getKeyNetwork = (network: INetwork) => {
  const keyCached = wmKey.get(network);

  if (keyCached) return keyCached;

  const obj = Object.keys(network)
    .reduce((p, nodeId) => {
      const { id, parents, states, cpt } = network[nodeId];
      p[id] = { id, parents, states, cpt };
      return p;
    }, {});
  
  const key = JSON.stringify(obj);
  
  wmKey.set(network, key);
  return key;
};

const getKeyGiven = given => {
  const keys = Object.keys(given);
  
  if (keys.length) {
    return keys.map(nodeId => ({ nodeId, state: given[nodeId] }))
      .reduce((str, {nodeId, state}) => `${str}-${nodeId}-${state}`, '')
  }
  
  return "NO GIVEN";
};

export const clearCache = () => {
  map.clear();
}

const createCliquesInfo = (network: INetwork) => {
  const moralGraph = buildMoralGraph(network);
  const triangulatedGraph = buildTriangulatedGraph(moralGraph);
  const { cliqueGraph, cliques, sepSets } = buildCliqueGraph(triangulatedGraph);
  const junctionTree = buildJunctionTree(cliqueGraph, cliques, sepSets);

  return {
    emptyCliques: cliques, 
    sepSets,
    junctionTree,
  };
};

const propagationCliques = (cliques: IClique[], network: INetwork, junctionTree: IGraph, sepSets: ISepSet[], given: ICombinations = {}) => {
  const key = getKeyGiven(given);
  const cached = map.get(key);
  if (cached !== undefined) return cached;
  
  initializePotentials(cliques, network, given);
  globalPropagation(network, junctionTree, cliques, sepSets);

  const result = normalize(cliques);
  map.set(key, result);
  return result;
};

const normalize = (cliques: IClique[]) => {
  return cliques.map(({ id, potentials, clique }) => ({
    id,
    clique,
    potentials: normalizePotentials(potentials)
  }));
};

const normalizePotentials = (potentials: ICliquePotentialItem[]) => {
  const sum = potentials.reduce((acc, { then }) => acc + then, 0);
  
  return potentials.map(({ when, then }) => ({
    when,
    then: then / sum,
  }));
}

const getsepSet = (sepSets: ISepSet[], id: string, neighborId: string) => {
  const temp = sepSets.find(x => {
    return (x.ca === neighborId && x.cb === id) || (x.ca === id && x.cb === neighborId);
  });

  return temp.sharedNodes.sort();
};

const createMessage = (combinations: ICombinations[], potentials: ICliquePotentialItem[], messageReceived = null) => {
  const initCombs = combinations.map(x => ({ when: x, then: 0 }))
  const message: ICliquePotentialItem[] = [];

  for (const { when } of initCombs) {
    const keys = Object.keys(when);
    const potentialsThen = potentials
      .filter(potential => keys.every(key => when[key] === potential.when[key]))
      .map(x => x.then);
    const then = sum(potentialsThen);
      
      message.push({
        then,
        when: cloneDeep(when),
      });
  }

  if (messageReceived) {
    for (const row of message) {
      const { when, then } = row;
      const whenKeys = Object.keys(when);
      const mr = messageReceived.find(mr => whenKeys.every(wk => mr.when[wk] === when[wk]));
      const value = then / (mr.then || 1);
      
      row.then = value;
    }
  }

  // return normalizePotentials(message);
  return message;
};

const divideMessage = (clique: IClique, message) => {
  if (message.length) {
    const keys = Object.keys(message[0].when);

    for (const row of message) {
      clique.potentials
        .filter(potential => {
          return keys.every(x => row.when[x] === potential.when[x]);
        })
        .forEach(potential => {
          potential.then = potential.then / row.then;
        });
    }
  }
};

const absorvMessage = (clique: IClique, message) => {
  if (message.length) {
    const keys = Object.keys(message[0].when);

    for (const row of message) {
      clique.potentials
        .filter(potential => {
          return keys.every(x => row.when[x] === potential.when[x]);
        })
        .forEach(potential => {
          potential.then = potential.then * row.then;
        });
    }
  }
};

const bestRootIndex = () => {
  return 0;
};

const globalPropagation = (network: INetwork, junctionTree: IGraph, cliques: IClique[], sepSets: ISepSet[]) => {
  const { isMarked, mark, unmark, unmarkAll } = flager();
  const nonParentNodes = Object.keys(network)
    .map(nodeId => network[nodeId])
    .filter(({ parents }) => parents.length === 0)
    .map(({ id }) => id);

  const collectEvidence = (id: string, parentId: string = null) => {
    mark(id);

    const neighbors = junctionTree.getNeighborsOf(id)
      .filter(x => !isMarked(x));

    for (const neighbor of neighbors) {
      collectEvidence(neighbor, id);
    }

    if (parentId !== null) {
      const clique = cliques.find(x => x.id === id);
      const sepSet = getsepSet(sepSets, id, parentId).filter(x => nonParentNodes.indexOf(x) === -1);
      const potentials = clique.potentials;
      const combinations = buildCombinations(network, sepSet);
      const message = createMessage(combinations, potentials);
      const parent = cliques.find(x => x.id === parentId);

      // parent.oldPotentials = clone(parent.potentials);
      parent.messagesReceived.set(clique.id, message);
      absorvMessage(parent, message);
    }

    unmark(id);
  };

  const distributeEvidence = (id: string) => {
    mark(id);

    const clique = cliques.find(x => x.id === id);
    // const potentials = clique.oldPotentials;
    const { messagesReceived, potentials } = clique;

    const neighbors = junctionTree.getNeighborsOf(id)
      .filter(x => !isMarked(x));
    
    for (const neighborId of neighbors) {
      const sepSet = getsepSet(sepSets, id, neighborId).filter(x => nonParentNodes.indexOf(x) === -1);
      const messageReceived = messagesReceived.get(neighborId);
      const combinations = buildCombinations(network, sepSet);
      const message = createMessage(combinations, potentials, messageReceived);
      const neighbor = cliques.find(x => x.id === neighborId);

      absorvMessage(neighbor, message);
      distributeEvidence(neighborId);
    }

    unmark(id);
  };

  if (cliques.length > 1) {
    const nodes = junctionTree.getNodesId();
    const root = nodes[bestRootIndex()];

    unmarkAll();
    collectEvidence(root);

    unmarkAll();
    distributeEvidence(root);
  }
};

const initializePotentials = (cliques: IClique[], network: INetwork, given: ICombinations) => {
  const givenKeys = Object.keys(given);
  const getInitalValue = (comb: ICombinations) => {
    if (givenKeys.length) {
      const combKeys = Object.keys(comb);
      const inter = intersection(givenKeys, combKeys);
      
      if (combKeys.length) {
        const all = inter.every(gk => comb[gk] == given[gk]);
        
        return all ? 1 : 0;
      }
    }
    return 1;
  }

  for (const clique of cliques) {
    clique.factors = [];
    clique.potentials = [];
    clique.messagesReceived = new Map();
  }

  for (const nodeId of Object.keys(network)) {
    const node = network[nodeId];
    const nodes = node.parents.concat(node.id);

    for (const clique of cliques) {
      if (nodes.every(x => clique.clique.some(y => x === y))) {
        clique.factors.push(nodeId);
        //break?
      }
    }
  }

  for (const clique of cliques) {
    const combinations = buildCombinations(network, clique.clique);

    for (const combination of combinations) {
      let value = getInitalValue(combination);

      if (value > 0) {
        for (const factorId of clique.factors) {
          const factor = network[factorId];

          if (factor.parents.length > 0) {
            const when = network[factorId].parents
              .reduce((acc, x) => ({ ...acc, [x]: combination[x] }), {});

            const cptRow = (<ICptWithParents>factor.cpt).find(x => isEqual(x.when, when));

            value *= cptRow.then[combination[factorId]];
          } else {
            value *= factor.cpt[combination[factorId]];
          }
        }
      }
      
      clique.potentials.push({
        when: combination,
        then: value
      });
    }

    delete clique.factors;
  }
};

const buildJunctionTree = (cliqueGraph: IGraph, cliques: IClique[], sepSets: ISepSet[]): IGraph => {
  sepSets.sort((a, b) => b.sharedNodes.length - a.sharedNodes.length);

  const spanningTree = [];

  const hasCycle = () => {
    const visited = {};

    const visit = (cliqueId, parentId) => {
      visited[cliqueId] = true;

      const adjsA = spanningTree
        .filter(x => x.ca === cliqueId)
        .map(x => x.cb);

      const adjsB = spanningTree
        .filter(x => x.cb === cliqueId)
        .map(x => x.ca);

      const adjs = adjsA.concat(adjsB);

      for (const adj of adjs) {
        if (!visited[adj]) {
          if (visit(adj, cliqueId)) {
            return true;
          }
        } else if (adj !== parentId) {
          return true;
        }
      }

      return false;
    };

    for (let i = 0; i < cliques.length; i++) {
      visited[cliques[i].id] = false;
    }

    for (let i = 0; i < cliques.length; i++) {
      if (!visited[cliques[i].id]) {
        if (visit(cliques[i].id, null)) {
          return true;
        }
      }
    }

    return false;
  };

  for (let i = 0; i < sepSets.length; i++) {
    spanningTree.push(sepSets[i]);

    if (hasCycle()) {
      spanningTree.pop();
    }
  }

  const junctionTree = cliqueGraph.clone();

  for (let i = sepSets.length - 1; i >= 0; i--) {
    const shouldRemove = !spanningTree.some(x => x === sepSets[i]);

    if (shouldRemove) {
      junctionTree.removeEdge(sepSets[i].ca, sepSets[i].cb);
      sepSets.splice(i, 1);
    }
  }

  return junctionTree;
};