import { Injectable } from '@angular/core';
import { Training } from '../../../core/training/model/training';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Exercise } from '../../../core/exercise/model/exercise';
import { sortNumerical } from '../../utils/CommonUtils';

const TRAININGS_URL = 'http://localhost:3000/trainings';

@Injectable({
    providedIn: 'root',
})
export class TrainingService {

    constructor(private httpClient: HttpClient) {}

    public getTrainings(): Observable<Training[]> {
        return this.httpClient.get<Array<Training>>(TRAININGS_URL);
    }

    public getTrainingByID(id: number): Observable<Training> {
        return this.httpClient.get<Training>(TRAININGS_URL + '/' + id);
    }

    public postTraining(training: Training): Observable<Training> {
        return this.httpClient.post<Training>(TRAININGS_URL, training);
    }

    public putTraining(training: Training): Observable<Training> {
        return this.httpClient.put<Training>(
            TRAININGS_URL + '/' + training.id,
            training
        );
    }

    public deleteTrainingByID(id: number): Observable<Training> {
        return this.httpClient.delete<Training>(TRAININGS_URL + '/' + id);
    }

    /**
     * Get all trainings that contain the given exercise.
     *
     * @param trainings The trainings to look for specified exercise.
     * @param exercise The exercise which will be used as a filter value.
     * @returns Returns a training array where a trainings contain the given
     * exercise.
     */
    public retrieveTrainingsFromExercise(
        trainings: Training[],
        exercise: Exercise
    ): Training[] {
        return this.sortByDate(trainings).filter(
            (training) =>
                training.exercises.filter(
                    (other) => exercise.name === other.name
                ).length > 0
        );
    }

    /**
     * Sort the specified trainings numerically.
     *
     * @param trainings The trainings array that should be sorted.
     * @returns Returns a numerically sorted list of trainings.
     */
    public sortByDate(trainings: Training[]) {
        return trainings.sort((a, b) =>
            sortNumerical(
                Date.parse(a.date.toString()),
                Date.parse(b.date.toString())
            )
        );
    }

    /**
     * Extract the locale date as string representation from the given training.
     *
     * @param training The training to extract the string from.
     * @returns Returns a local date string representation from the given training.
     */
    public extractLocaleDateString(training: Training): string {
        return new Date(training.date).toLocaleString();
    }
}
