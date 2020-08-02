import { Injectable } from '@angular/core';
import { Training } from '../../../core/training/model/training';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Exercise } from '../../../core/exercise/model/exercise';
import { UtilityService } from '../utils/utility.service';

@Injectable({
  providedIn: 'root',
})
export class TrainingService {
  url = 'http://localhost:3000/trainings';

  constructor(
    private utilityService: UtilityService,
    private httpClient: HttpClient
  ) {}

  public getAllTrainings(): Observable<Training[]> {
    return this.httpClient.get<Array<Training>>(this.url);
  }

  public getTrainingByID(id: number): Observable<Training> {
    return this.httpClient.get<Training>(this.url + '/' + id);
  }

  public postTraining(training: Training): Observable<Training> {
    return this.httpClient.post<Training>(this.url, training);
  }

  public deleteTrainingByID(id: number): Observable<Training> {
    return this.httpClient.delete<Training>(this.url + '/' + id);
  }

  /**
   * @param trainings to look for specified exercise
   * @param exercise which should be included in training
   */
  public retrieveTrainingsIncludingExercise(
    trainings: Training[],
    exercise: Exercise
  ): Training[] {
    return this.retrieveTrainingsSortedByDate(trainings).filter(
      (training) =>
        training.exercices.filter((other) => exercise.name === other.name)
          .length > 0
    );
  }

  public retrieveTrainingsSortedByDate(trainings: Training[]) {
    return trainings.sort((training, other) =>
      this.utilityService.sortNumerical(
        Date.parse(training.date.toString()),
        Date.parse(other.date.toString())
      )
    );
  }

  public extractLocaleDateStringFromTraining(training: Training): string {
    return new Date(training.date).toLocaleString();
  }
}
