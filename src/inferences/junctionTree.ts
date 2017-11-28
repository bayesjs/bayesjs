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
  IMoralGraph,
  IEdge,
  IGraph
} from '../types/index';
import hash from 'object-hash';
import { 
  buildMoralGraph, 
  buildTriangulatedGraph, 
  createGraph 
} from '../graphs/index';
import { buildCombinations } from '../utils/index';

const wmJT = new WeakMap();
const wmKey = new WeakMap();
const map = new Map();
let rootIndex = 0;

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

  return whenNodeIds.every((whenNodeId) => {
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

const getCliqueByLength = (minOrMax) => (cliques: IClique[]) => 
  minOrMax(cliques, ({ clique }) => clique.length); 

const getMinialCliqueLength = getCliqueByLength(minBy);
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

const getKeyGiven = (given) => {
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
  const { cliqueGraph, cliques, sepSets } = buildCliqueGraph(triangulatedGraph, network);
  const junctionTree = buildJunctionTree(cliqueGraph, cliques, sepSets);

  return {
    emptyCliques: cliques, 
    sepSets,
    junctionTree,
  };
};

const propagationCliques = (cliques: IClique[], network: INetwork, junctionTree, sepSets: ISepSet[], given: ICombinations = {}) => {
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

const normalizePotentials = (potentials) => {
  const sum = potentials.reduce((acc, { then }) => acc + then, 0);
  
  return potentials.map(({ when, then }) => ({
    when,
    then: then / sum,
  }));
}

const getsepSet = (sepSets: ISepSet[], id, neighborId) => {
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
    const newThen = potentials
      .filter(potential => keys.every(x => when[x] === potential.when[x]))
      .map(x => x.then)
      .reduce((acc, x) => acc + x);
      
      message.push({
        then: newThen,
        when: cloneDeep(when),
      });
  }

  if (messageReceived) {
    for (const row of message) {
      const { when, then } = row;
      const whenKeys = Object.keys(when);
      const mr = messageReceived.find((mr) => whenKeys.every(wk => mr.when[wk] === when[wk]));
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

const removeFromArray = (array, string) => {
  const index = array.indexOf(string);
  if (index !== -1) {
      array.splice(index, 1);
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
  return rootIndex;
};

const globalPropagation = (network: INetwork, junctionTree, cliques: IClique[], sepSets: ISepSet[]) => {
  let marked = [];
  const nonParentNodes = Object.keys(network)
    .map(nodeId => network[nodeId])
    .filter(({ parents }) => parents.length === 0)
    .map(({ id }) => id);

  const unmark = (id) => {
    marked = marked.filter(x => x !== id);
  };

  const unmarkAll = () => {
    marked = [];
  };

  const isMarked = id => {
    return marked.some(x => x === id);
  };

  const mark = id => {
    marked.push(id);
  };

  const collectEvidence = (id, parentId = null) => {
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

  const distributeEvidence = id => {
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
    const nodes = junctionTree.getNodes();
    const root = nodes[bestRootIndex()];
    // const root = nodes[nodes.length - 1];

    unmarkAll();
    collectEvidence(root);

    unmarkAll();
    distributeEvidence(root);
  }
};

const initializePotentials = (cliques: IClique[], network: INetwork, given: ICombinations) => {
  const givenKeys = Object.keys(given);
  const getInitalValue = (comb) => {
    if (givenKeys.length) {
      const combKeys = Object.keys(comb);
      const inter = intersection(givenKeys, combKeys);
      
      if (combKeys.length) {
        const all = inter.every((gk) => comb[gk] == given[gk]);
        
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

const buildJunctionTree = (cliqueGraph, cliques, sepSets) => {
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

const buildCliqueGraph = (triangulatedGraph, net) => {
  const cliqueGraph = createGraph();

  const cliques: IClique[] = [];
  const nodes = triangulatedGraph.getNodes();

  for (let i = 0; i < nodes.length; i++) {
    const clique = [ nodes[i] ];

    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;
      // else if (intersection(net[nodes[i]].network, net[nodes[j]].network).length > 0) continue;
      // else if (net[nodes[i]].network !== net[nodes[j]].network) continue;

      if (clique.every(node => triangulatedGraph.areConnected(node, nodes[j]))) {
        clique.push(nodes[j]);
      }
    }

    clique.sort();

    if (!cliques.some(x => isEqual(x.clique, clique))) {
      cliques.push({
        id: cliques.length.toString(),
        clique
      });
    }
  }

  const sepSets: ISepSet[] = [];

  for (let i = 0; i < cliques.length; i++) {
    cliqueGraph.addNode(cliques[i].id);

    for (let j = i + 1; j < cliques.length; j++) {
      if (i === j) {
        continue;
      }

      const sharedNodes = [];

      for (let k = 0; k < cliques[j].clique.length; k++) {
        if (cliques[i].clique.some(x => x === cliques[j].clique[k])) {
          sharedNodes.push(cliques[j].clique[k]);
        }
      }

      if (sharedNodes.length > 0) {
        cliqueGraph.addEdge(cliques[i].id, cliques[j].id);
        sepSets.push({ ca: cliques[i].id, cb: cliques[j].id, sharedNodes });
      }
    }
  }

  return {
    cliqueGraph,
    cliques,
    sepSets
  };
};


