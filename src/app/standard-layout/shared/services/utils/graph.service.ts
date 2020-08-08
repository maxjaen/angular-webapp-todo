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

  /**
   * @param trainings to be mapped
   * @param exercise which should be find in training exercises atleast once
   */
  public initGraphDataForExerciseProgress(
    trainings: Training[],
    exercise: Exercise
  ): NameAndNumberPair[] {
    return trainings
      .filter((training) =>
        training.exercices.find((other) => exercise.category === other.category)
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
   * @param weights to be mapped
   * @returns new key value pair from weight
   */
  public initGraphDataForWeights(weights: Weight[]): NameAndNumberPair[] {
    return weights.map((weight) => {
      return {
        name: weight.date.toString(),
        value: weight.value,
      };
    });
  }

  /**
   * @param pair whose value should be mapped from milliseconds to minutes
   * @returns new new key value pair with minutes as value
   */
  public createAccumulationGraph(
    pair: NameAndNumberPair[]
  ): NameAndNumberPair[] {
    return pair.map((entry) => {
      return {
        name: entry.name,
        value: +(entry.value / 60 / 60 / 1000).toFixed(3),
      };
    });
  }
}
