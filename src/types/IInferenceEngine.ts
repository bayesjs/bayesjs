import { INetworkResult, ICombinations, ICptWithParents, ICptWithoutParents, IInferAllOptions } from '.'

export interface IInferenceEngine {

  hasVariable: (name: string) => boolean;
  getVariables: () => string[];

  getParents: (name: string) => string[];
  hasParent: (name: string, parent: string) => boolean;

  getLevels: (name: string) => string[];
  hasLevel: (name: string, level: string) => boolean;

  setDistribution: (name: string, cpt: ICptWithParents | ICptWithoutParents) => void;
  getDistribution: (name: string) => ICptWithParents | ICptWithoutParents | null;

  hasEvidenceFor: (name: string) => boolean;
  setEvidence: (evidence: { [name: string]: string }) => void;
  updateEvidence: (evidence: { [name: string]: string }) => void;
  removeEvidence: (name: string) => void;
  removeAllEvidence: () => void;

  infer: (event: ICombinations) => number;
  inferAll: (options?: IInferAllOptions) => INetworkResult;

}
