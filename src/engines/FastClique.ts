import { CliqueId, NodeId, FormulaId, ConnectedComponentId } from './common'

export type FastClique = {
  id: CliqueId;
  name: string;
  factors: NodeId[];
  domain: NodeId[];
  neighbors: CliqueId[];
  messagesReceived: FormulaId[][];
  prior: FormulaId;
  posterior: FormulaId;
  belongsTo: ConnectedComponentId;
  separators: NodeId[];
}
