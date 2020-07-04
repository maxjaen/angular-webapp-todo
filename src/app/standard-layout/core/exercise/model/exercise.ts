import { ExercisePattern } from "./pattern/exercise-pattern";

export class Exercise {
  id: number;
  category: string;
  name: string;
  checked: boolean;
  pattern: ExercisePattern;
  string: string;
}
