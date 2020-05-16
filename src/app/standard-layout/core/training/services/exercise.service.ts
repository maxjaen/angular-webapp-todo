import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Exercise } from "../model/exercise";

@Injectable({
  providedIn: "root"
})
export class ExerciseService {
  url = "http://localhost:3000/exercises";

  constructor(private httpClient: HttpClient) {}

  getAllExercises(): Observable<Exercise[]> {
    return this.httpClient.get<Array<Exercise>>(this.url);
  }

  postExercise(exercise: Exercise): Observable<Exercise> {
    return this.httpClient.post<Exercise>(this.url, exercise);
  }

  deleteExercise(exercise: Exercise): Observable<Exercise> {
    return this.httpClient.delete<Exercise>(this.url + "/" + exercise.id);
  }
}
