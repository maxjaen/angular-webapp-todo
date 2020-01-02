import { Injectable } from '@angular/core';
import { Training } from '../model/training';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TrainingService {
  url = "http://localhost:3000/trainings";

  constructor(private httpClient: HttpClient) { }

  getAllTrainings (): Observable<Training[]> {
    return this.httpClient.get<Array<Training>>(this.url);
  }
  
  postTraining(training: Training): Observable<Training>{
    return this.httpClient.post<Training>(this.url, training);
  }
}
