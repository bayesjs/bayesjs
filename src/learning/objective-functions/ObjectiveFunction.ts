import { InferenceEngine } from '../..'
import { TowerOfDerivatives } from '../TowerOfDerivatives'

export type ObjectiveFunction = (engine: InferenceEngine) => TowerOfDerivatives
