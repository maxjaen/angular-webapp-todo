import { Injectable } from "@angular/core";
import { Exercise } from "../model/exercise";
import { Training } from "../../training/model/training";

@Injectable({
  providedIn: "root",
})
export class PatternAnalysisService {
  constructor() {}

  calculateWeightPattern(training: Training, exercise: Exercise): string {
    const foundExercises = training.exercices.filter(
      (e) => e.name == exercise.name
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
        return sum + " kg";
      case "conditionalpattern1d":
        let unit: string = "";
        foundExercises.forEach((e) => {
          const records: number = +e["records"];
          const repetitions: number = +e["repetitions"];
          unit = e["unit"];

          sum += records * repetitions;
        });
        return sum + unit;

      case "countablepattern":
        foundExercises.forEach((e) => {
          const records: number = +e["records"];
          const repetitions: number = +e["repetitions"];

          sum += records * repetitions;
        });
        return sum + "";

      case "conditionalpattern2d":
        foundExercises.forEach((e) => {
          const period: number = +e["period"];
          const speed: number = +e["speed"];

          sum += (speed / 60) * period;
        });
        return sum.toFixed(2) + "km";

      default:
        break;
    }

    return "";
  }

  calculateWeightPatternEntry(training: Training, exercise: Exercise): string {
    const foundExercises = training.exercices.filter(
      (e) => e.name == exercise.name
    );

    let entry = "";

    switch (foundExercises[0].category) {
      case "weightpattern":
        foundExercises.forEach((e) => {
          const records: number = +e["records"];
          const repetitions: number = +e["repetitions"];
          const weight: number = +e["weight"];

          entry += records + "/" + repetitions + "/" + weight + ", ";
        });
        break;

      case "conditionalpattern1d":
        foundExercises.forEach((e) => {
          const records: number = +e["records"];
          const repetitions: number = +e["repetitions"];
          const unit: string = e["unit"];

          entry += records + "/" + repetitions + unit + ", ";
        });
        break;

      case "conditionalpattern2d":
        foundExercises.forEach((e) => {
          const period: number = +e["period"];
          const unitperiod: string = e["unitperiod"];
          const speed: number = +e["speed"];
          const unitspeed: string = e["unitspeed"];

          entry +=
            period + " " + unitperiod + "/" + speed + " " + unitspeed + ", ";
        });
        break;

      case "countablepattern":
        foundExercises.forEach((e) => {
          const records: number = +e["records"];
          const repetitions: number = +e["repetitions"];

          entry += records + "/" + repetitions + ", ";
        });
        break;

      default:
        break;
    }

    return entry.substring(0, entry.length - 2);
  }
}
