import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Exercise } from "../model/exercise";

@Injectable({
  providedIn: "root",
})
export class ExerciseService {
  url = "http://localhost:3000/exercises";

  constructor(private httpClient: HttpClient) {}

  /*
   * ===================================================================================
   * CRUD TASK OPERATIONS
   * ===================================================================================
   */

  getAllExercises(): Observable<Exercise[]> {
    return this.httpClient.get<Array<Exercise>>(this.url);
  }

  postExercise(exercise: Exercise): Observable<Exercise> {
    return this.httpClient.post<Exercise>(this.url, exercise);
  }

  deleteExercise(exercise: Exercise): Observable<Exercise> {
    return this.httpClient.delete<Exercise>(this.url + "/" + exercise.id);
  }

  /*
   * ===================================================================================
   * OTHER EXERCISE OPERATIONS
   * ===================================================================================
   */

  // Compare exercise categories in an array
  // Returns unique exercise categories
  selectDistinctExerciseCategories(exercises: Exercise[]): Array<string> {
    return exercises.map((e) => e.category).filter(this.onlyUniques);
  }

  // Checks if an element is unique in an array
  onlyUniques(value: string, index: number, self: string[]) {
    return self.indexOf(value) === index;
  }

  isInCategory(exercise: Exercise, category: string) {
    return exercise["category"] == category;
  }

  getExercisesFromCategorySorted(exercises: Exercise[], category: string) {
    return exercises
      .filter((e) => this.isInCategory(e, category))
      .sort((a, b) => {
        if (a.name > b.name) {
          return 1;
        }

        if (a.name < b.name) {
          return -1;
        }

        return 0;
      });
  }
}
