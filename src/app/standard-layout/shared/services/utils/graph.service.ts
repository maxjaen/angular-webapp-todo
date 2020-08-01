import { Injectable } from '@angular/core';
import { Training } from '../../../core/training/model/training';
import { NameAndNumberPair } from '../../model/GraphData';
import { Exercise } from '../../../core/exercise/model/exercise';
import { PatternAnalysisService } from './pattern-analysis.service';
import { Weight } from '../../../core/weight/model/weight';

@Injectable({
  providedIn: 'root',
})
export class GraphDataService {
  constructor(private patternAnalysisService: PatternAnalysisService) {}

  /*
   * Get graph data format for exercise details
   */
  public initGraphDataForExerciseDetails(
    trainings: Training[],
    exercise: Exercise
  ): NameAndNumberPair[] {
    const arr: NameAndNumberPair[] = [];

    trainings
      .filter((e) => e.exercices.find((f) => f.category === exercise.category))
      .forEach((g) => {
        const element: NameAndNumberPair = {
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
   * Get graph data format for time tasks
   */
  public initGraphDataForAccumulatedNameAndNumberValuePair(
    pair: NameAndNumberPair[]
  ): NameAndNumberPair[] {
    const arr: NameAndNumberPair[] = [];

    pair.forEach((e) => {
      const element: NameAndNumberPair = {
        name: e.name,
        value: +(e.value / 60 / 60 / 1000).toFixed(3),
      };
      arr.push(element);
    });
    return arr;
  }

  /*
   * Get graph data format for weights
   */
  public initGraphDataForWeights(weights: Weight[]): NameAndNumberPair[] {
    const arr: NameAndNumberPair[] = [];

    weights.forEach((e) => {
      const element: NameAndNumberPair = {
        name: e.date.toString(),
        value: e.value,
      };
      arr.push(element);
    });
    return arr;
  }
}
