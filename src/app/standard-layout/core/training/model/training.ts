import { Exercise } from '../../exercise/model/exercise';

export class Training {
  id: number;
  date: Date;
  description: string;
  exercices: Exercise[];
}
