import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Weight } from '../model/weight';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeightService {
  url = "http://localhost:3000/weights";

  constructor(private httpClient: HttpClient) { }

  getAllWeights (): Observable<Weight[]> {
    return this.httpClient.get<Array<Weight>>(this.url);
  }
  
  getWeightByID (id: number): Observable<Weight[]> {
    return this.httpClient.get<Array<Weight>>(this.url + "/" + id);
  }

  postWeight(weight: Weight): Observable<Weight>{
    return this.httpClient.post<Weight>(this.url, weight);
  }

  putWeight(weight: Weight): Observable<Weight>{
    return this.httpClient.put<Weight>(this.url + "/" + weight.id, weight);
  }

  deleteWeight(id: number): Observable<Weight>{
    return this.httpClient.delete<Weight>(this.url + "/" + id);
  }
}