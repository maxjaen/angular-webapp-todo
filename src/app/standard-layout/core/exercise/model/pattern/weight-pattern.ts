import { ExercisePattern } from './exercise-pattern';

export class WeightPattern extends ExercisePattern {
  name = 'weightpattern';
  records: number;
  repetitions: number;
  weight: number;
  unit: string;
}
