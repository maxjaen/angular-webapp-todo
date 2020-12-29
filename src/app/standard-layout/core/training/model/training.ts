import { TrainingType } from 'src/app/standard-layout/shared/model/Enums';
import { Exercise } from '../../exercise/model/exercise';

export class Training {
  id: number;
  date: Date;
  description: string;
  exercises: Exercise[];
  type: TrainingType;
}
