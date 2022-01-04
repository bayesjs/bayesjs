import { CliqueId, NodeId, FormulaId, ConnectedComponentId } from './common'

// This type is a representation of a junction tree clique which
// has been designed to quickly locate related cliques (neighbors),
// potentials, formulas, messages, evidence and separators.  This
// information is used during inference and retraction of evidence
// to quickly locate potentials of interest.
export type FastClique = {
  id: CliqueId;
  name: string;
  factors: NodeId[];
  domain: NodeId[];
  neighbors: CliqueId[];
  messagesReceived: FormulaId[][];
  prior: FormulaId;
  posterior: FormulaId;
  evidence: FormulaId[];
  belongsTo: ConnectedComponentId;
  separators: NodeId[];
}
