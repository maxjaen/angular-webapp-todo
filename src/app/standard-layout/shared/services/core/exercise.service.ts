import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Exercise } from "../../../core/exercise/model/exercise";
import { UtilityService } from "../utils/utility.service";

@Injectable({
  providedIn: "root",
})
export class ExerciseService {
  url = "http://localhost:3000/exercises";

  constructor(
    private utilityService: UtilityService,
    private httpClient: HttpClient
  ) {}

  // ===================================================================================
  // CRUD TASK OPERATIONS
  // ===================================================================================

  public getAllExercises(): Observable<Exercise[]> {
    return this.httpClient.get<Array<Exercise>>(this.url);
  }

  public postExercise(exercise: Exercise): Observable<Exercise> {
    return this.httpClient.post<Exercise>(this.url, exercise);
  }

  public deleteExercise(exercise: Exercise): Observable<Exercise> {
    return this.httpClient.delete<Exercise>(this.url + "/" + exercise.id);
  }

  // ===================================================================================
  // OTHER EXERCISE OPERATIONS
  // ===================================================================================

  /*
   * Compare exercise categories in an array
   * Returns unique exercise categories
   */
  public selectDistinctExerciseCategories(
    exercises: Exercise[]
  ): Array<string> {
    return exercises
      .map((e) => e.category)
      .filter(this.utilityService.sortDistinct);
  }

  /*
   * Get all exercises which have the same category as the input category
   */
  public getExercisesFromCategorySorted(
    exercises: Exercise[],
    category: string
  ) {
    return exercises
      .filter((e) => this.isInCategory(e, category))
      .sort((a, b) => this.utilityService.sortAlphabetical(a.name, b.name));
  }

  // ===================================================================================
  // TEST EXERCISE OPERATIONS
  // ===================================================================================

  /*
   * Checks if the category of an input exercise equals an input category
   */
  private isInCategory(exercise: Exercise, category: string) {
    return exercise["category"] === category;
  }
}
