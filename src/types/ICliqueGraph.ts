import { IClique, IGraph } from '.'

export interface ICliqueGraph {
  graph: IGraph;
  cliques: IClique[];
}
