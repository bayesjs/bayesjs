import { isEmpty, intersection, union } from 'lodash';
import { IGraph, IClique } from '../types/index';

export const findCliques = (graph: IGraph): IClique[] => {
  let id = 0;
  const cliques: IClique[] = [];
  const { bronKerbosch2 } = bronKerbosch2Maker(graph, nodeIds => {
    cliques.push({
      id: `${id++}`,
      nodeIds
    });
  })

  bronKerbosch2([], graph.getNodesId(), []);
  
  return cliques;
}

const areEmpty = (...lists: string[][]) => {
  return lists.every(list => isEmpty(list));
}

const getPivotsMaker = (graph: IGraph) => (P: string[], X: string[]): string[] => {
  return union(P, X).reduce((selected, nodeId) => {
    const t = intersection(graph.getNeighborsOf(nodeId), P);

    return t.length > selected.length ? t : selected;
  }, []);
}

const aNotInB = (a: string[], b: string[]): string[] => {
  return a.filter(x =>
    b.indexOf(x) === -1
  )
};

export const bronKerbosch2Maker = (graph: IGraph, onFindClique: (clique: string[]) => void) => {
  const getPivots = getPivotsMaker(graph);

  const bronKerbosch2 = (R: string[], P: string[], X: string[]) => {
    if (areEmpty(P, X)) {
      onFindClique(R);
    }

    const pivots = getPivots(P, X);

    for (const v of aNotInB(P, pivots)) {
      const neighbors = graph.getNeighborsOf(v);
      
      bronKerbosch2(
        [ ...R, v], 
        intersection(P, neighbors), 
        intersection(X, neighbors)
      );
      const removeIndexP = P.indexOf(v);

      P.splice(removeIndexP, 1)
      X.push(v);
    }
  }

  return {
    bronKerbosch2
  };
}