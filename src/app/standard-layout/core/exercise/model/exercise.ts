import { ExercisePattern } from './pattern/exercise-pattern';
import { Pattern } from 'src/app/standard-layout/shared/model/Enums';

export class Exercise {
  /** needed */
  id: number;
  category: Pattern;
  name: string;
  checked: boolean;
  pattern: ExercisePattern;
  str: string;

  /** optional */
  repetitions?: number;
  records?: number;
  period?: number;
  speed?: number;
  unit?: string;
  weight?: number;
  unitPeriod?: string;
  unitSpeed?: string;
}
