import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Weight } from '../../../core/weight/model/weight';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class WeightService {

    private url = 'http://localhost:3000/weights';

    constructor(private httpClient: HttpClient) {}

    public getAllWeights(): Observable<Weight[]> {
        return this.httpClient.get<Array<Weight>>(this.url);
    }

    public getWeightByID(id: number): Observable<Weight[]> {
        return this.httpClient.get<Array<Weight>>(this.url + '/' + id);
    }

    public postWeight(weight: Weight): Observable<Weight> {
        return this.httpClient.post<Weight>(this.url, weight);
    }

    public putWeight(weight: Weight): Observable<Weight> {
        return this.httpClient.put<Weight>(this.url + '/' + weight.id, weight);
    }

    public deleteWeight(id: number): Observable<Weight> {
        return this.httpClient.delete<Weight>(this.url + '/' + id);
    }
}
