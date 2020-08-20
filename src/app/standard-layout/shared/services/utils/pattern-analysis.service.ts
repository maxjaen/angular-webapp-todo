import { Injectable } from '@angular/core';
import { Exercise } from '../../../core/exercise/model/exercise';
import { Training } from '../../../core/training/model/training';
import { Pattern } from '../../model/Enums';

@Injectable({
  providedIn: 'root',
})
export class PatternAnalysisService {
  constructor() {}

  /**
   * Get all exercises in a training that have the same name value as the input exercise
   * @param training to get all exercises from
   * @param exercise to search the same name in the input training
   */
  private getExercisesInTrainingWithName(
    training: Training,
    exercise: Exercise
  ): Exercise[] {
    return training.exercises.filter((e) => e.name === exercise.name);
  }

  /**
   * Get all exercises in a training that have the same name value as the input exercise
   * @param training to be searched for same exercise
   * @param exercise to be searched in training
   */
  public calculateExerciseResultStringForTraining(
    training: Training,
    exercise: Exercise
  ): string {
    const foundExercises = this.getExercisesInTrainingWithName(
      training,
      exercise
    );

    let sum = 0;

    switch (foundExercises[0].category) {
      case Pattern.WEIGHT:
        foundExercises.forEach((e) => {
          const records: number = +e['records'];
          const repetitions: number = +e['repetitions'];
          const weight: number = +e['weight'];

          sum += records * repetitions * weight;
        });
        return `${sum} kg`;
      case Pattern.COUNTABLE:
        foundExercises.forEach((e) => {
          const records: number = +e['records'];
          const repetitions: number = +e['repetitions'];

          sum += records * repetitions;
        });
        return `${sum}`;
      case Pattern.CONDITIONAL1:
        let unit = '';
        foundExercises.forEach((e) => {
          const records: number = +e['records'];
          const repetitions: number = +e['repetitions'];
          unit = e['unit'];

          sum += records * repetitions;
        });
        return `${sum}${unit}`;
      case Pattern.CONDITIONAL2:
        foundExercises.forEach((e) => {
          const period: number = +e['period'];
          const speed: number = +e['speed'];

          sum += (speed / 60) * period;
        });
        return `${sum.toFixed(2)}km`;
      default:
        break;
    }

    return '';
  }

  /**
   * Calculates overall number for each exercise to make comparable with other exercises
   * @param training to get exercises from
   * @param exercise to calculate overall measurement number from
   */
  public calculateExerciseResultForTraining(
    training: Training,
    exercise: Exercise
  ): number {
    const foundExercises = this.getExercisesInTrainingWithName(
      training,
      exercise
    );

    let sum = 0;

    switch (foundExercises[0].category) {
      case Pattern.WEIGHT:
        foundExercises.forEach((e) => {
          const records: number = +e['records'];
          const repetitions: number = +e['repetitions'];
          const weight: number = +e['weight'];

          sum += records * repetitions * weight;
        });
        break;
      case Pattern.COUNTABLE:
      case Pattern.CONDITIONAL1:
        foundExercises.forEach((e) => {
          const records: number = +e['records'];
          const repetitions: number = +e['repetitions'];

          sum += records * repetitions;
        });
        break;
      case Pattern.CONDITIONAL2:
        foundExercises.forEach((e) => {
          const period: number = +e['period'];
          const speed: number = +e['speed'];

          sum += (speed / 60) * period;
        });
        break;
      default:
        break;
    }

    return sum;
  }

  /**
   * Create string representation for the specified records of each exercise
   * @param training to be shown and clickable on user interface
   * @param exercise that will displayed with it's training measurements like repetitions etc.
   */
  public calculateExerciseRecordsForTraining(
    training: Training,
    exercise: Exercise
  ): string {
    const foundExercises = this.getExercisesInTrainingWithName(
      training,
      exercise
    );

    let entry = '';

    switch (foundExercises[0].category) {
      case Pattern.WEIGHT:
        foundExercises.forEach((e) => {
          const records: number = +e['records'];
          const repetitions: number = +e['repetitions'];
          const weight: number = +e['weight'];

          entry += `${records}/${repetitions}/${weight}, `;
        });
        break;
      case Pattern.COUNTABLE:
        foundExercises.forEach((e) => {
          const records: number = +e['records'];
          const repetitions: number = +e['repetitions'];

          entry += `${records}/${repetitions}, `;
        });
        break;
      case Pattern.CONDITIONAL1:
        foundExercises.forEach((e) => {
          const records: number = +e['records'];
          const repetitions: number = +e['repetitions'];
          const unit: string = e['unit'];

          entry += `${records}/${repetitions}${unit}, `;
        });
        break;
      case Pattern.CONDITIONAL2:
        foundExercises.forEach((e) => {
          const period: number = +e['period'];
          const unitPeriod: string = e['unitPeriod'];
          const speed: number = +e['speed'];
          const unitSpeed: string = e['unitSpeed'];

          entry += `${period} ${unitPeriod}/${speed} ${unitSpeed}, `;
        });
        break;
      default:
        break;
    }

    return entry.substring(0, entry.length - 2); // cut the last comma and space
  }
}
