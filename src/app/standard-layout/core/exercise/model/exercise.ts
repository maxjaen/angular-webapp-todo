import { ExercisePattern } from './pattern/exercise-pattern';
import { Pattern } from 'src/app/standard-layout/shared/model/Enums';

export class Exercise {
  id: number;
  category: Pattern;
  name: string;
  checked: boolean;
  pattern: ExercisePattern;
  string: string;
}
