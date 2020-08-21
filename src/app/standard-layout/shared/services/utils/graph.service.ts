import { Injectable } from '@angular/core';
import { Training } from '../../../core/training/model/training';
import { NumberValueGraph } from '../../model/GraphData';
import { Exercise } from '../../../core/exercise/model/exercise';
import { PatternAnalysisService } from './pattern-analysis.service';
import { Weight } from '../../../core/weight/model/weight';

@Injectable({
  providedIn: 'root',
})
export class GraphDataService {
  constructor(private patternAnalysisService: PatternAnalysisService) {}

  /**
   * Create data from trainings that can be visualized with a graph
   *
   * @param trainings to be mapped
   * @param exercise which should be find in training exercises at least once
   * @returns array of entries with date as key and exercise result as number value
   */
  public initGraphDataForExerciseProgress(
    trainings: Training[],
    exercise: Exercise
  ): NumberValueGraph[] {
    return trainings
      .filter((training) =>
        training.exercises.find((other) => exercise.category === other.category)
      )
      .map((trainingIncludesCategory) => {
        return {
          name: new Date(trainingIncludesCategory.date).toLocaleString(),
          value: this.patternAnalysisService.calculateExerciseResultForTraining(
            trainingIncludesCategory,
            exercise
          ),
        };
      });
  }

  /**
   * Create data from weights that can be visualized with a graph
   *
   * @param weights to be mapped
   * @returns array of entries with date as key and specified weight as number value
   */
  public initGraphDataForWeights(weights: Weight[]): NumberValueGraph[] {
    return weights.map((weight) => {
      return {
        name: weight.date.toString(),
        value: weight.value,
      };
    });
  }

  /**
   * Helper function to convert already created graph data into different unit,
   * for example when the number value is a minute, it could possibly be converted into seconds.
   *
   * @param pair whose value should be mapped from milliseconds to minutes
   * @returns array of entries with date as key and specified number value
   */
  public createAccumulationGraph(pair: NumberValueGraph[]): NumberValueGraph[] {
    return pair.map((entry) => {
      return {
        name: entry.name,
        value: +(entry.value / 60 / 60 / 1000).toFixed(3),
      };
    });
  }
}
