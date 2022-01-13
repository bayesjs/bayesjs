
import { TowerOfDerivatives } from './TowerOfDerivatives'

/** A step result is a data structure designed to hold the results
 * of either the newtonStep or lineSearch function.
 */
export type StepResult = {
  // The size of the step that was taken by the stepping function
  stepSize: number;
  // The tower of derivatives after taking the step
  tower: TowerOfDerivatives;
  // A status code indicating how the stepping function terminated
  status: StepStatus;
}

export enum StepStatus {
  STEP_TAKEN_TOWARD_MAXIMIZER,
  GRADIENT_TOO_SMALL,
  STEPSIZE_TOO_SMALL,
  BACKTRACKING_STEPS_EXCEEDED,
  STEPS_EXCEEDED
}

/** Create a human readable message for describing the results of the
 * iterative step.
 */
export function statusMessage (status: StepStatus) {
  switch (status) {
    case StepStatus.GRADIENT_TOO_SMALL: return 'The last step of the learning algorithm failed to locate ' +
       ' a set of parameters that reduced the gradient by more than the gradient tolerance.   The current set of' +
       ' parameters is either a maximizer for the objective function, or the gradient tolerance is too large.'
    case StepStatus.BACKTRACKING_STEPS_EXCEEDED: return 'The last step of the learning algorithm exceeded the ' +
       'maximum number of backtracking steps when searching for a better set of parameters.   The current set ' +
       'of parameters may not be a maximizer for the objective function .   You may want to try starting from ' +
       'a different set of priors, or using a different learning rate.'
    case StepStatus.STEPS_EXCEEDED: return 'Exceeded the maximum number of iterations when searching for ' +
       ' a maximizer for the objective function.   You may want to try starting from ' +
       'a different set of priors, or using a smaller tolerance.'
    case StepStatus.STEPSIZE_TOO_SMALL: return 'The last step of the learning algorithm failed to locate a' +
      ' set of parameters that is better than the returned value.   Current set of parameters is either a' +
      ' maximizer for the objective function, or the step tolerance is too large.'
    case StepStatus.STEP_TAKEN_TOWARD_MAXIMIZER: return ''
  }
}
