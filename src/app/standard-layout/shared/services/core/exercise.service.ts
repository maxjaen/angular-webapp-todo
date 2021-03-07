import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Exercise } from '../../../core/exercise/model/exercise';
import { Pattern } from '../../model/Enums';
import { sortAlphabetical, sortDistinct } from '../../utils/CommonUtils';

const EXERCISE_URL = 'http://localhost:3000/exercises';

@Injectable({
    providedIn: 'root',
})
export class ExerciseService {

    constructor(private httpClient: HttpClient) {}

    public getExercises(): Observable<Exercise[]> {
        return this.httpClient.get<Array<Exercise>>(EXERCISE_URL);
    }

    public postExercise(exercise: Exercise): Observable<Exercise> {
        return this.httpClient.post<Exercise>(EXERCISE_URL, exercise);
    }

    public deleteExercise(exercise: Exercise): Observable<Exercise> {
        return this.httpClient.delete<Exercise>(
            EXERCISE_URL + '/' + exercise.id
        );
    }

    /**
     * @param exercises to be mapped to distinct categories
     * @returns distinct array of categories
     */
    public retrieveDistinctCategoriesFromExercises(
        exercises: Exercise[]
    ): Array<Pattern> {
        return exercises
            .map((e) => e.category)
            .filter(sortDistinct)
            .reverse();
    }

    /**
     * @param exercises array of exercises to be searched
     * @param category needs to be include in exercise to be in filter
     * @returns sorted array of exercises who all include category
     */
    public retrieveSortedExercisesWithCategory(
        exercises: Exercise[],
        category: Pattern
    ) {
        return exercises
            .filter((e) => this.hasCategory(e, category))
            .sort((a, b) => sortAlphabetical(a.name, b.name));
    }

    /**
     * Get string instead of a number from pattern enum for better readability
     * on user interface.
     *
     * @param index is the position of the pattern in the array
     */
    public retrievePatternValueFromPattern(index: number) {
        return Object.values(Pattern)[index];
    }

    public retrievePatternProperties() {
        return Object.keys(Pattern).splice(0, Object.keys(Pattern).length / 2);
    }

    /**
     * Checks if an exercise has the specified category.
     *
     * @param exercise The exercise to be checked-
     * @param category The given category and will be compared to the
     * exercises category.
     */
    private hasCategory(exercise: Exercise, category: Pattern) {
        return exercise.category === category;
    }
}
