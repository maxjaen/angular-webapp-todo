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
     * Create displayable data from trainings that can be visualized within a
     * graph.
     *
     * @param trainings The training data that will be transformed to graph data.
     * @param exercise The exercise which should be find in training exercises at
     * least once.
     * @returns An array of entries with date as key and exercise result as number
     * value will be returned.
     */
    public initGraphDataForExerciseProgress(
        trainings: Training[],
        exercise: Exercise
    ): NumberValueGraph[] {
        return trainings
            .filter((training) =>
                training.exercises.find(
                    (other) => exercise.category === other.category
                )
            )
            .map((trainingIncludesCategory) => ({
                name: new Date(trainingIncludesCategory.date).toLocaleString(),
                value: this.patternAnalysisService.calculateExerciseResultForTraining(
                    trainingIncludesCategory,
                    exercise
                ),
            }));
    }

    /**
     * Create displayable data from weights that can be visualized within a graph.
     *
     * @param weights The weights that will be transformed within this function.
     * @returns An array of entries with date as key and specified weight as
     * number value will be returned.
     */
    public initGraphDataForWeights(weights: Weight[]): NumberValueGraph[] {
        return weights.map((weight) => ({
            name: weight.date.toString(),
            value: weight.value,
        }));
    }

    /**
     * Helper function to convert already created graph data into different units.
     * For example when the number value is a minute, it could possibly be
     * converted into seconds.
     *
     * @param pair whose value should be mapped from milliseconds to minutes
     * @returns An array of entries with date as key and specified number value
     * will be returned.
     */
    public createAccumulationGraph(
        pair: NumberValueGraph[]
    ): NumberValueGraph[] {
        return pair.map((entry) => ({
            name: entry.name,
            value: +(entry.value / 60 / 60 / 1000).toFixed(3),
        }));
    }
}
