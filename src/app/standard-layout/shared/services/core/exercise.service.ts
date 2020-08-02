import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Exercise } from '../../../core/exercise/model/exercise';
import { UtilityService } from '../utils/utility.service';

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
  ): Array<string> {
    return exercises
      .map((e) => e.category)
      .filter(this.utilityService.sortDistinct);
  }

  /**
   * @param exercises array of exercises to be searched
   * @param category needs to be include in exercise to be in filter
   * @returns sorted array of exercises who all include category
   */
  public retrieveSortedExercisesWithCategory(
    exercises: Exercise[],
    category: string
  ) {
    return exercises
      .filter((e) => this.hasCategory(e, category))
      .sort((a, b) => this.utilityService.sortAlphabetical(a.name, b.name));
  }

  private hasCategory(exercise: Exercise, category: string) {
    return exercise['category'] === category;
  }
}
