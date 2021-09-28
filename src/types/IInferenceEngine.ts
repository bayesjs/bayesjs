import { INetworkResult, ICombinations, ICptWithParents, ICptWithoutParents, IInferAllOptions } from '.'

/**
 * An inference engine is a self contained structure for performing inferences on
 * Bayesian Networks.   Classes that implement this interface can provide specific
 * optimizations (e.g. caches, partial updates, lazy evaluation) to facilitate
 * efficient repeated inferences.    Once instanciated, any implementation of this
 * interface must be mutable only via the provided functions.   This ensures that
 * any internally cached values will remain consistent.
 */
export interface IInferenceEngine {
  // Test if the underlying Bayesian network has  variable with the given name.
  hasVariable: (name: string) => boolean;
  // Get the list of variables in the underlying Bayesian network.
  getVariables: () => string[];

  // Given the name of a variable, query the underlying Bayesian network and
  // return the names of the parent nodes (aka the nodes upon which the
  // variable is conditioned)
  getParents: (name: string) => string[];

  // Given the name of a variable and a potential parent, query the underlying
  // Bayesian network.   Return true if and only if the given parent is one of
  // the parents of the given node.
  // Every implementation must satisfy the invariant:
  //   hasParent(n,m) <=> getVariables(n).includes(m)
  hasParent: (name: string, parent: string) => boolean;

  // Given the name of a variable, return the list of levels (states) for that
  // variable.
  getLevels: (name: string) => string[];
  // Given the name of a variable and a potential level for the variable, query
  // the underlying Bayesian network.   Return true if and only if the given level
  // is one of the parents of the given node.
  // Every implementation must satisfy the invariant:
  //   hasLevel(n,m) <=> getLevels(n).includes(m)
  hasLevel: (name: string, level: string) => boolean;

  // Replace the probability distribution for a given variable with a clone of the provided
  // cpt.   NOTE: If the probability distribution does not match the levels or
  // parents of the variable, the function must throw an errror.
  setDistribution: (name: string, cpt: ICptWithParents | ICptWithoutParents) => void;

  // Query the underlying Bayes network and return a clone of the probability
  // distribution for the given variable.
  getDistribution: (name: string) => ICptWithParents | ICptWithoutParents | null;

  // Test if evidence has been provided for the given variable.
  hasEvidenceFor: (name: string) => boolean;

  // Provide evidence for one or more variables in the Bayesian network,
  // and remove all evidence for variables that are not provided.
  setEvidence: (evidence: { [name: string]: string }) => void;
  // Provide evidence for one or more variables in the Bayesian network.
  // Variables that are not mentioned in the input retain any previous
  // evidence.
  updateEvidence: (evidence: { [name: string]: string }) => void;
  // Remove the evidence for the specified variable.
  removeEvidence: (name: string) => void;
  // remove the evidence for all the variables in the network.
  removeAllEvidence: () => void;

  // Given an event, query the network.   Return the probability of the
  // event given any evidence that has been provided.
  infer: (event: ICombinations) => number;

  // Query the Bayes network to get the marginal distributions for
  // all variables, given any evidence that has been provided.  The
  // optional parameters may be provided to control the prescision
  // of the results returned.
  // NOTE: Any implementation of this method should perform any
  // internal computations at full precision.
  inferAll: (options?: IInferAllOptions) => INetworkResult;

}
