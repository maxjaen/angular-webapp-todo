import { Injectable } from "@angular/core";
import { Training } from "../model/training";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Exercise } from "../../exercise/model/exercise";

@Injectable({
  providedIn: "root",
})
export class TrainingService {
  url = "http://localhost:3000/trainings";

  constructor(private httpClient: HttpClient) {}

  /*
   * ===================================================================================
   * CRUD TASK OPERATIONS
   * ===================================================================================
   */

  getAllTrainings(): Observable<Training[]> {
    return this.httpClient.get<Array<Training>>(this.url);
  }

  getTrainingByID(id: number): Observable<Training> {
    return this.httpClient.get<Training>(this.url + "/" + id);
  }

  postTraining(training: Training): Observable<Training> {
    return this.httpClient.post<Training>(this.url, training);
  }

  deleteTrainingByID(id: number): Observable<Training> {
    return this.httpClient.delete<Training>(this.url + "/" + id);
  }

  /*
   * ===================================================================================
   * OTHER TASK OPERATIONS
   * ===================================================================================
   */

  getSortedTrainings(trainings: Training[]) {
    return trainings.sort(function (a, b) {
      return Date.parse(b.date.toString()) - Date.parse(a.date.toString());
    });
  }

  getSortedTrainingFromExercise(trainings: Training[], exercise: Exercise) {
    return trainings
      .filter(
        (e) => e.exercices.filter((e) => e.name == exercise.name).length > 0
      )
      .sort(function (a, b) {
        return Date.parse(b.date.toString()) - Date.parse(a.date.toString());
      });
  }
}
