import { Injectable } from "@angular/core";
import { Training } from "../../core/training/model/training";
import { NameAndNumberPair } from "../model/NameAndNumberPair";
import { Exercise } from "../../core/exercise/model/exercise";
import { PatternAnalysisService } from "../../core/exercise/services/pattern-analysis.service";
import { Weight } from '../../core/weight/model/weight';

@Injectable({
  providedIn: "root",
})
export class GraphDataService {
  constructor(private patternAnalysisService: PatternAnalysisService) {}

  /*
   * Get graph data for exercise details
   */
  initGraphDataForExerciseDetails(
    trainings: Training[],
    exercise: Exercise
  ): NameAndNumberPair[] {
    let arr: NameAndNumberPair[] = [];

    trainings
      .filter((e) => e.exercices.find((f) => f.category == exercise.category))
      .forEach((g) => {
        let element: NameAndNumberPair = {
          name: new Date(g.date).toLocaleString(),
          value: this.patternAnalysisService.calculateExerciseResultForTraining(
            g,
            exercise
          ),
        };
        arr.push(element);
      });
    return arr;
  }

  /*
   * Get graph data for time tasks
   */
  initGraphDataForAccumulatedNameAndNumberValuePair(
    pair: NameAndNumberPair[]
  ): NameAndNumberPair[] {
    let arr: NameAndNumberPair[] = [];

    pair.forEach((e) => {
      let element: NameAndNumberPair = {
        name: e.name,
        value: +(e.value / 60 / 60 / 1000).toFixed(3),
      };
      arr.push(element);
    });
    return arr;
  }

  initGraphDataForWeights(weights: Weight[]): NameAndNumberPair[] {
      let arr: NameAndNumberPair[] = [];

    weights.forEach((e) => {
      let element: NameAndNumberPair = {
        name: e.date.toString(),
        value: e.value,
      };
      arr.push(element);
    });
    return arr;
  }
}
