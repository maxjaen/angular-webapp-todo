import { Injectable } from "@angular/core";
import { Training } from "../../../core/training/model/training";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Exercise } from "../../../core/exercise/model/exercise";
import { UtilityService } from "../utils/utility.service";

@Injectable({
  providedIn: "root",
})
export class TrainingService {
  url = "http://localhost:3000/trainings";

  constructor(
    private utilityService: UtilityService,
    private httpClient: HttpClient
  ) {}

  // ==================================================
  // CRUD TASK OPERATIONS
  // ==================================================

  public getAllTrainings(): Observable<Training[]> {
    return this.httpClient.get<Array<Training>>(this.url);
  }

  public getTrainingByID(id: number): Observable<Training> {
    return this.httpClient.get<Training>(this.url + "/" + id);
  }

  public postTraining(training: Training): Observable<Training> {
    return this.httpClient.post<Training>(this.url, training);
  }

  public deleteTrainingByID(id: number): Observable<Training> {
    return this.httpClient.delete<Training>(this.url + "/" + id);
  }

  // ==================================================
  // OTHER TASK OPERATIONS
  // ==================================================

  /*
   * Get all trainings from given trainings
   * Sorted by date
   */
  public getSortedTrainings(trainings: Training[]) {
    return trainings.sort((a, b) =>
      this.utilityService.sortNumerical(
        Date.parse(a.date.toString()),
        Date.parse(b.date.toString())
      )
    );
  }

  /*
   * Get all trainings from given trainings which enlude given exercise
   * Sorted by date
   */
  public getSortedTrainingFromExercise(
    trainings: Training[],
    exercise: Exercise
  ) {
    return this.getSortedTrainings(trainings).filter(
      (e) => e.exercices.filter((f) => f.name == exercise.name).length > 0
    );
  }

  /*
   * Return formated date string from training
   */
  public getDateFromTraining(training: Training): string {
    return new Date(training.date).toLocaleString();
  }
}
