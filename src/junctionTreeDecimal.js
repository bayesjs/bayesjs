// @flow

import isEqual from 'lodash/isequal';
import { BigDecimal, RoundingMode } from 'bigdecimal';

type Potential = {
  then: number,
  when: { [id: string]: string }[]
};

type PotentialBigDecimal = {
  then: BigDecimal,
  when: { [id: string]: string }[]
};

type CliqueFinal = {
  id: string,
  clique: string[],
  potentials: Potential[],
}

type Clique = {
  id: string,
  clique: string[],
  potentials: PotentialBigDecimal[],
  oldPotentials?: PotentialBigDecimal[],
  factors?: string[],
};

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

type SepSet = {
  ca: string, 
  cb: string, 
  sharedNodes: string[],
}


const enableLog = true;

const log = (...args) => {
  if (!enableLog) return;
  console.log(...args);
};

const logTable = (arg: any) => {
  if (!enableLog) return;
  console.table(arg);
};

const logTableCliques = (cliques: Clique[]) => {
  // if (!enableLog) return;
  // for (let clique of cliques) {
  //   let objs = [];
  //   let sumAll = 0;

  //   for (let { when, then } of clique.potentials) {
  //     let obj = { then };
  //     sumAll = sum(sumAll, then);

  //     for (let key of Object.keys(when)) {
  //       obj[key] = when[key];
  //     }
  //     objs.push(obj);
  //   }
  //   objs.push({ then: sumAll })
    
  //   logTable(objs);
  // }
}

const logTableCliquesFinal = (cliques: CliqueFinal[]) => {
  if (!enableLog) return;
  for (let clique of cliques) {
    let objs = [];
    let sumAll = 0;

    for (let { when, then } of clique.potentials) {
      let obj = { then };
      sumAll += then;

      for (let key of Object.keys(when)) {
        obj[key] = when[key];
      }
      objs.push(obj);
    }
    objs.push({ then: sumAll })
    
    logTable(objs);
  }
}

// const multiply = (a, b) => {
//   return ((a * 10000000000) * (b * 10000000000)) / 100000000000000000000;
// };

// const sum = (a, b) => {
//   return ((a * 10000000000) + (b * 10000000000)) / 10000000000;
// };

const cliquesCache = new WeakMap();
const roundingMode = RoundingMode.HALF_UP();
let scale = 1;

export function infer(network: Network, nodes: Combinations, given: Combinations = {}, scale2 = 1) {
  scale = scale2;//DEBUG
  let cliques: Clique[] = cliquesCache.get(network);

  if (cliques === undefined) {
    cliques = buildCliques({ ...network }, given);
    cliquesCache.set(network, cliques);
  }
  
  const nodesToInfer = Object.keys(nodes);

  // TODO: considerar P(A,B,C), por enquanto só P(A)
  const nodeToInfer = nodesToInfer[0];

  const clique = cliques.find(x => x.clique.some(y => y === nodeToInfer));

  const result = clique.potentials
    .filter(x => x.when[nodeToInfer] === nodes[nodeToInfer])
    .map(x => x.then)
    .reduce((acc, x) => acc.add(x));
  
  return result.setScale(scale, roundingMode).doubleValue();
}

const normalize = (cliques: Clique[]): Clique[] => {
  log('normalize', cliques);

  for (let clique of cliques) {
    const { potentials } = clique;
    let sumAll = new BigDecimal('0');
    let hasEvidence = false;

    for (let potential of potentials) {
      const { then } = potential;

      if (then == 0) hasEvidence = true;
      // sumAll = sum(sumAll, then);
      sumAll = sumAll.add(then);
    }
    
    const sum = sumAll.setScale(scale, roundingMode).intValue();
    
    if ((sum < 1) || (sum > 1)) { // Math.round cause 1.0000000000002 (example)
      for (let potential of potentials) {
        potential.then = potential.then.divide(sumAll, scale, roundingMode);
      }
    }

    log('SUM', sum);
  }

  // const final: CliqueFinal[] = cliques.map(({ id, clique, potentials }) => {
  //   let newPotentials: Potential[] = [];
    
  //   for (let { when, then } of potentials) {
  //     newPotentials.push({
  //       when,
  //       then: then.setScale(scale, roundingMode).doubleValue()
  //     });
  //   }

  //   return {
  //     id,
  //     clique,
  //     potentials: newPotentials
  //   }
  // });

  log('*** NORMALIZE ***');
  // logTableCliquesFinal(final);

  return cliques;
};

const buildCliques = (network: Network, given: Combinations): Clique[] => {
  const moralGraph = buildMoralGraph(network);
  // log('MORAL GRAPH');
  // moralGraph.print();
  // log();

  const triangulatedGraph = buildTriangulatedGraph(moralGraph);
  // log('TRIANGULATED GRAPH');
  // triangulatedGraph.print();
  // log();
  // triangulatedGraph.print();
  const { cliqueGraph, cliques, sepSets } = buildCliqueGraph(triangulatedGraph, network);
  log('cliques', cliques);
  log('*** CLIQUES ***');
  log(
    cliques.map(({clique}) => {
      return clique.map(v => {
        if (v.indexOf('--') === -1) return v;
        return v.split('--')[1];
      }).join('|')
    }).join('\n')
  );
  log('******');
  // log('CLIQUE GRAPH');
  // cliqueGraph.print();
  // log('cliques');
  // console.dir(cliques);
  // log('sepSets');
  // console.dir(sepSets);
  // log();

  const junctionTree = buildJunctionTree(cliqueGraph, cliques, sepSets);
  // log('JUNCTION TREE');
  // junctionTree.print();
  // log('cliques');
  // console.dir(cliques);
  // log('sepSets');
  // console.dir(sepSets);
  // log();

  initializePotentials(cliques, network, given);
  // log('initialized cliques');
  // console.dir(cliques);
  // log();
  

  globalPropagation(network, junctionTree, cliques, sepSets);
  // log('propagated cliques');
  // console.dir(cliques);
  // log();
  
  return normalize(cliques);
};

const globalPropagation = (network: Network, junctionTree, cliques: Clique[], sepSets: SepSet[]) => {
  let marked = [];

  const unmarkAll = () => {
    marked = [];
  };

  const isMarked = (id): boolean => {
    return marked.some(x => x === id);
  };

  const mark = (id) => {
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
      const sepSet = sepSets.find(x => {
        return (x.ca === parentId && x.cb === id) || (x.ca === id && x.cb === parentId);
      }).sharedNodes;
      const potentials = clique.potentials;

      log('start collectEvidence for clique', clique.clique.join('|'));

      const message = buildCombinations(network, sepSet)
        .map(x => ({ when: x, then: 0 }));

      for (const row of message) {
        row.then = potentials
          .filter(potential => {
            return Object.keys(row.when).every(x => row.when[x] === potential.when[x]);
          })
          .map(x => x.then)
          .reduce((acc, x) => acc.add(x));
      }
      
      log('send message: ', message, sepSet);

      const parent = cliques.find(x => x.id === parentId);

      parent.oldPotentials = parent.potentials.map(x => ({ when: x.when, then: x.then }));
      
      for (const row of message) {
        parent.potentials
          .filter(potential => {
            return Object.keys(row.when).every(x => row.when[x] === potential.when[x]);
          })
          .forEach(potential => {
            // potential.then *= row.then;
            potential.then = potential.then.multiply(row.then);
          });
      }

      log('end collectEvidence for clique', clique.clique.join('|'));
    }
  };

  const distributeEvidence = id => {
    mark(id);

    const clique = cliques.find(x => x.id === id);
    const potentials = clique.oldPotentials;
    log('start distributeEvidence for clique', clique.clique.join('|'));

    delete clique.oldPotentials;

    const neighbors = junctionTree.getNeighborsOf(id)
      .filter(x => !isMarked(x));
    
    for (const neighborId of neighbors) {
      const sepSet = sepSets.find(x => {
        return (x.ca === neighborId && x.cb === id) || (x.ca === id && x.cb === neighborId);
      }).sharedNodes;

      const message = buildCombinations(network, sepSet)
        .map(x => ({ when: x, then: 0 }));

      for (const row of message) {
        row.then = potentials
          .filter(potential => {
            return Object.keys(row.when).every(x => row.when[x] === potential.when[x]);
          })
          .map(x => x.then)
          .reduce((acc, x) => acc.add(x));
      }

      log('send message', message, sepSet);

      // if (message.every(x => x.then == 1)) {if all values are 1, nothing will change after all.
      //   log('ALL ONE');
      //   continue;
      // }

      const neighbor = cliques.find(x => x.id === neighborId);

      for (const row of message) {
        neighbor.potentials
          .filter(potential => {
            return Object.keys(row.when).every(x => row.when[x] === potential.when[x]);
          })
          .forEach(potential => {
            // potential.then *= row.then;
            potential.then = potential.then.multiply(row.then);
          });
      }
    }

    for (const neighbor of neighbors) {
      distributeEvidence(neighbor);
    }

    log('end distributeEvidence for clique', clique.clique.join('|'));
  };

  const nodes = junctionTree.getNodes();
  const root = nodes[0];
  // const root = nodes[nodes.length - 1];

  log('*** CLIQUE ROOT ***');
  log(cliques.find(({ id }) => id == root).clique.join('|'));
  log('*** CLIQUE ROOT ***');

  unmarkAll();
  log('------------------------------------------');
  collectEvidence(root);
  log('------------------------------------------');

  // logTableCliques(cliques);
  log(cliques);

  unmarkAll();
  log('------------------------------------------');
  distributeEvidence(root);
  log('------------------------------------------');

  log('FINAL CLIQUES', cliques);
  logTableCliques(cliques);
};

const initializePotentials = (cliques: Clique[], network: Network, given: Combinations) => {
  log('given', given);
  const givenKeys = given ? Object.keys(given) : [];
  const getInitalValue = (comb) => {
    if (givenKeys.length > 0) {
      const combKeys = Object.keys(comb);
      const inter = intersection(givenKeys, combKeys);
      
      if (combKeys.length) {
        const all = inter.every(gk => {
          return comb[gk] == given[gk];
        });
        
        return new BigDecimal(all ? '1' : '0');
      }
    }
    return new BigDecimal('1');
  }

  for (const clique of cliques) {
    clique.factors = [];
    clique.potentials = [];
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
    // log(clique.clique);
    const combinations = buildCombinations(network, clique.clique);
    // log('clique', clique, combinations);

    for (const combination of combinations) {
      let value = getInitalValue(combination);;

      if (value > 0) {
        for (const factorId of clique.factors) {
          const factor = network[factorId];
          
          if (factor.parents.length > 0) {
            const when = network[factorId].parents
              .reduce((acc, x) => ({ ...acc, [x]: combination[x] }), {});

            const cptRow = factor.cpt.find(x => isEqual(x.when, when));
            const v = cptRow.then[combination[factorId]];

            // value *= cptRow.then[combination[factorId]];
            value = value.multiply(new BigDecimal(v));
          } else {
            const v = factor.cpt[combination[factorId]];
            // value *= factor.cpt[combination[factorId]];
            value = value.multiply(new BigDecimal(v));
          }
        }

      }

      log(combination, value.toPlainString());

      clique.potentials.push({
        when: combination,
        then: value
      });
    }

    delete clique.factors;
  }

};

const buildCombinations = (network, nodesToCombine) => {
  const combinations = [];

  const makeCombinations = (nodes, acc = {}) => {
    if (nodes.length === 0) {
      combinations.push(acc);
      return;
    }

    const [ nodeId, ...rest ] = nodes;
    const states = network[nodeId].states;

    for (const state of states) {
      makeCombinations(rest, {
        ...acc,
        [nodeId]: state
      });
    }
  };

  makeCombinations(nodesToCombine);

  return combinations;
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

const intersection = (listA, listB) => {
  // log(listA, listB);
  let a = new Set(listA);
  let b = new Set(listB);
  let intersection = new Set([...a].filter(x => b.has(x)));

  return [...intersection];
}

const buildCliqueGraph = (triangulatedGraph, net) => {
  const cliqueGraph = createGraph();

  const cliques: Clique[] = [];
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

  const sepSets: SepSet[] = [];

  for (let i = 0; i < cliques.length; i++) {
    cliqueGraph.addNode(cliques[i].id);

    for (let j = i + 1; j < cliques.length; j++) {
      if (i === j) {
        continue;
      }

      const sharedNodes: string[] = [];

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

const buildTriangulatedGraph = moralGraph => {
  const triangulatedGraph = moralGraph.clone();
  const clonedGraph = triangulatedGraph.clone();
  const nodes = clonedGraph.getNodes();
  const nodesToRemove = [ ...nodes ];

  const findLessNeighbors = () => {
    if (nodesToRemove.length == 1) return nodesToRemove.shift();
    let index = 0;
    let candidateNeighbors = clonedGraph.getNeighborsOf(nodesToRemove[index]);

    for (let i = 1; i < nodesToRemove.length; i++) {
      const node = nodesToRemove[i];
      const neighbors = clonedGraph.getNeighborsOf(node);

      if (neighbors.length < candidateNeighbors.length) {
        index = i;
        candidateNeighbors = neighbors;
      }
    }

    const node = nodesToRemove[index];
    nodesToRemove.splice(index, 1);
    return node;
  };

  while (nodesToRemove.length > 0) {
    const nodeToRemove = findLessNeighbors();
    const neighbors = clonedGraph.getNeighborsOf(nodeToRemove).filter(id => nodesToRemove.indexOf(id) > -1);
    
    for (let i = 0; i < neighbors.length; i++) {
      for (let j = i + 1; j < neighbors.length; j++) {
        const neighborA = neighbors[i];
        const neighborB = neighbors[j];

        if (!clonedGraph.containsNode(neighborA) || !clonedGraph.containsNode(neighborB)) {
          continue;
        }

        if (!clonedGraph.areConnected(neighborA, neighborB)) {
          clonedGraph.addEdge(neighborA, neighborB);
          triangulatedGraph.addEdge(neighborA, neighborB);
        }
      }
    }

    clonedGraph.removeNode(nodeToRemove.node);
  }

  return triangulatedGraph;
};

const buildMoralGraph = (network: Network) => {
  const nodes = Object.keys(network).map(id => network[id]);
  const moralGraph = createGraph();

  for (const node of nodes) {
    moralGraph.addNode(node.id);

    for (const parentId of node.parents) {
      moralGraph.addEdge(parentId, node.id);
    }
  }

  for (const node of nodes) {
    for (let i = 0; i < node.parents.length; i++) {
      for (let j = i + 1; j < node.parents.length; j++) {
        if (!moralGraph.areConnected(node.parents[i], node.parents[j])) {
          moralGraph.addEdge(node.parents[i], node.parents[j]);
        }
      }
    }
  }

  return moralGraph;
};

const createGraph = () => {
  const nodes = [];
  const edges = [];

  const addNode = node => {
    nodes.push(node);
  };

  const removeNode = node => {
    for (let i = edges.length - 1; i >= 0; i--) {
      if (edges[i][0] === node || edges[i][1] === node) {
        edges.splice(i, 1);
      }
    }

    for (let i = nodes.length - 1; i >= 0; i--) {
      if (nodes[i] === node) {
        nodes.splice(i, 1);
        break;
      }
    }
  };

  const getNodes = () => {
    return nodes;
  };

  const containsNode = node => {
    return nodes.some(x => x === node);
  };

  const addEdge = (nodeA, nodeB) => {
    edges.push([ nodeA, nodeB ]);
  };

  const removeEdge = (nodeA, nodeB) => {
    for (let i = edges.length - 1; i >= 0; i--) {
      const shouldRemove =
        (edges[i][0] === nodeA && edges[i][1] === nodeB) ||
        (edges[i][0] === nodeB && edges[i][1] === nodeA);

      if (shouldRemove) {
        edges.splice(i, 1);
      }
    }
  };

  const areConnected = (nodeA, nodeB) => {
    return edges.some(edge => {
      return (edge[0] === nodeA && edge[1] === nodeB) ||
             (edge[0] === nodeB && edge[1] === nodeA);
    });
  };

  const getNeighborsOf = node => {
    const neighbors = [];

    for (const edge of edges) {
      if (edge[0] === node) {
        neighbors.push(edge[1]);
      } else if (edge[1] === node) {
        neighbors.push(edge[0]);
      }
    }

    return neighbors;
  };

  const clone = () => {
    const clonedGraph = createGraph();

    for (const node of nodes) {
      clonedGraph.addNode(node);
    }

    for (const edge of edges) {
      clonedGraph.addEdge(edge[0], edge[1]);
    }

    return clonedGraph;
  };

  return {
    addNode,
    removeNode,
    getNodes,
    containsNode,
    addEdge,
    removeEdge,
    areConnected,
    getNeighborsOf,
    clone,
    print: () => {
      log('nodes');
      console.dir(nodes);
      log('edges');
      console.dir(edges);
    }
  };
};
