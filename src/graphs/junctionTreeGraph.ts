import { IGraph, IClique, ISepSet } from '../types/index';


export const buildJunctionTree = (cliqueGraph: IGraph, cliques: IClique[], sepSets: ISepSet[]): IGraph => {
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