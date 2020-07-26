import { Injectable } from "@angular/core";
import { Exercise } from "../../../core/exercise/model/exercise";
import { Training } from "../../../core/training/model/training";

@Injectable({
  providedIn: "root",
})
export class PatternAnalysisService {
  constructor() {}

  refactoring;
  /*
   * Get all Exercises in a training that have the same name value as the input exercise
   */
  private getExercisesInTrainingWithName(
    training: Training,
    exercise: Exercise
  ): Exercise[] {
    return training.exercices.filter((e) => e.name == exercise.name);
  }

  /*
   * Get all Exercises in a training that have the same name value as the input exercise
   */
  public calculateExerciseResultStringForTraining(
    training: Training,
    exercise: Exercise
  ): string {
    const foundExercises = this.getExercisesInTrainingWithName(
      training,
      exercise
    );

    let sum: number = 0;

    switch (foundExercises[0].category) {
      case "weightpattern":
        foundExercises.forEach((e) => {
          const records: number = +e["records"];
          const repetitions: number = +e["repetitions"];
          const weight: number = +e["weight"];

          sum += records * repetitions * weight;
        });
        return `${sum} kg`;
      case "conditionalpattern1d":
        let unit: string = "";
        foundExercises.forEach((e) => {
          const records: number = +e["records"];
          const repetitions: number = +e["repetitions"];
          unit = e["unit"];

          sum += records * repetitions;
        });
        return `${sum}${unit}`;

      case "countablepattern":
        foundExercises.forEach((e) => {
          const records: number = +e["records"];
          const repetitions: number = +e["repetitions"];

          sum += records * repetitions;
        });
        return `${sum}`;

      case "conditionalpattern2d":
        foundExercises.forEach((e) => {
          const period: number = +e["period"];
          const speed: number = +e["speed"];

          sum += (speed / 60) * period;
        });
        return `${sum.toFixed(2)}km`;

      default:
        break;
    }

    return "";
  }

  public calculateExerciseResultForTraining(
    training: Training,
    exercise: Exercise
  ): number {
    const foundExercises = this.getExercisesInTrainingWithName(
      training,
      exercise
    );

    let sum: number = 0;

    switch (foundExercises[0].category) {
      case "weightpattern":
        foundExercises.forEach((e) => {
          const records: number = +e["records"];
          const repetitions: number = +e["repetitions"];
          const weight: number = +e["weight"];

          sum += records * repetitions * weight;
        });
        break;

      case "conditionalpattern1d":
        let unit: string = "";
        foundExercises.forEach((e) => {
          const records: number = +e["records"];
          const repetitions: number = +e["repetitions"];

          sum += records * repetitions;
        });
        break;

      case "countablepattern":
        foundExercises.forEach((e) => {
          const records: number = +e["records"];
          const repetitions: number = +e["repetitions"];

          sum += records * repetitions;
        });
        break;

      case "conditionalpattern2d":
        foundExercises.forEach((e) => {
          const period: number = +e["period"];
          const speed: number = +e["speed"];

          sum += (speed / 60) * period;
        });
        break;

      default:
        break;
    }

    return sum;
  }

  public calculateExerciseRecordsForTraining(
    training: Training,
    exercise: Exercise
  ): string {
    const foundExercises = this.getExercisesInTrainingWithName(
      training,
      exercise
    );

    let entry = "";

    switch (foundExercises[0].category) {
      case "weightpattern":
        foundExercises.forEach((e) => {
          const records: number = +e["records"];
          const repetitions: number = +e["repetitions"];
          const weight: number = +e["weight"];

          entry += `${records}/${repetitions}/${weight}, `;
        });
        break;

      case "conditionalpattern1d":
        foundExercises.forEach((e) => {
          const records: number = +e["records"];
          const repetitions: number = +e["repetitions"];
          const unit: string = e["unit"];

          entry += `${records}/${repetitions}${unit}, `;
        });
        break;

      case "conditionalpattern2d":
        foundExercises.forEach((e) => {
          const period: number = +e["period"];
          const unitperiod: string = e["unitperiod"];
          const speed: number = +e["speed"];
          const unitspeed: string = e["unitspeed"];

          entry += `${period} ${unitperiod}/${speed} ${unitspeed}, `;
        });
        break;

      case "countablepattern":
        foundExercises.forEach((e) => {
          const records: number = +e["records"];
          const repetitions: number = +e["repetitions"];

          entry += `${records}/${repetitions}, `;
        });
        break;

      default:
        break;
    }

    // cut the last comma and space in the result string
    return entry.substring(0, entry.length - 2);
  }
}
