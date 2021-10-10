
import { NodeId, FormulaId, CliqueId } from './common'

export type FastNode = {
  id: NodeId;
  name: string;
  parents: NodeId[];
  children: NodeId[];
  formula: FormulaId;
  evidenceFunction: FormulaId;
  posteriorMarginal: FormulaId; // The posterior marginal can be obtained my marginalizing any message or clique after making the network consistent
  cliques: CliqueId[];
  levels: string[];
}
