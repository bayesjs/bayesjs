export type TowerOfDerivatives = {
  // The set of parameters at which the objective function was evaluated
  xs: number[][];
  // The value of the objective function at the given set of parameters
  value: number;
  // The gradient of the objective function at the given coordinate.   This is stored
  // using the same indexing scheme as the parameters.
  gradient: number[][];
  // The hessian matrix of the objective function, evaluated at the given parameter
  // values.   Since this is a diagonal matrix, we store it using the same indexing
  // scheme as the parameters
  hessian: number[][];
  // The condition number for the Hessian matrix.   Larger condition numbers indicate
  // that the matrix is better conditioned that smaller condition numbers.
  conditionNumber: number;
  // The Newton or quasi-Newton ascent direction from the current set of parameters.
  ascentDirection: number[][];
  // The magnitude (l2 norm) of the ascent direction
  ascentDirectionMagnitude: number;
  // The directional derivative at the current set of coordinates.   For an ascent
  // direction, the directional derivative should be positive.
  directionalDerivative: number;
}
