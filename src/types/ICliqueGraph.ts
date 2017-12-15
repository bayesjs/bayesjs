import { IGraph, IClique, ISepSet } from "./index";

export interface ICliqueGraph {
  cliqueGraph: IGraph,
  cliques: IClique[],
  sepSets: ISepSet[]
}