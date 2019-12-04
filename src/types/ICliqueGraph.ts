import { IGraph, IClique, ISepSet } from '.'

export interface ICliqueGraph {
  cliqueGraph: IGraph;
  cliques: IClique[];
  sepSets: ISepSet[];
}
