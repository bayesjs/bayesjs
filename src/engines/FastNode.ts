
import { NodeId, FormulaId, CliqueId } from './common'

// This type is a representation of a junction tree node which
// has been designed to quickly locate related nodes, cliques,
// potentials, formulas, messages, evidence and separators.  This
// information is used during inference and retraction of evidence
// to quickly locate potentials of interest.
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
