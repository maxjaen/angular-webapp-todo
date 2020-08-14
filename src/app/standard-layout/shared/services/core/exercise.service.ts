import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Exercise } from '../../../core/exercise/model/exercise';
import { UtilityService } from '../utils/utility.service';
import { Pattern } from '../../model/Enums';

@Injectable({
  providedIn: 'root',
})
export class ExerciseService {
  url = 'http://localhost:3000/exercises';

  constructor(
    private utilityService: UtilityService,
    private httpClient: HttpClient
  ) {}

  public getExercises(): Observable<Exercise[]> {
    return this.httpClient.get<Array<Exercise>>(this.url);
  }

  public postExercise(exercise: Exercise): Observable<Exercise> {
    return this.httpClient.post<Exercise>(this.url, exercise);
  }

  public deleteExercise(exercise: Exercise): Observable<Exercise> {
    return this.httpClient.delete<Exercise>(this.url + '/' + exercise.id);
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
      .filter(this.utilityService.sortDistinct)
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
      .sort((a, b) => this.utilityService.sortAlphabetical(a.name, b.name));
  }

  /**
   * Checks if an exercise has the specified category
   * @param exercise to be checked
   * @param category to be compared with exercises category
   */
  private hasCategory(exercise: Exercise, category: Pattern) {
    return exercise.category === category;
  }

  /**
   * Get String instead of number from pattern enum for better readability
   * on user interface
   * @param index is the position of the pattern in the array
   */
  public retrievePatternValueFromPattern(index: number) {
    return this.retrievePatternValues()[index];
  }

  private retrievePatternValues() {
    return Object.values(Pattern);
  }

  public retrievePatternKeys() {
    return Object.keys(Pattern).splice(0, Object.keys(Pattern).length / 2);
  }
}
