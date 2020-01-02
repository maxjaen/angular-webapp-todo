import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TimeElement } from '../model/zeiterfassung';

@Injectable({
  providedIn: 'root'
})
export class ZeiterfassungService {
  url = "http://localhost:3000/zeiterfassung";

  constructor(private httpClient: HttpClient) { }

  getAllTimeElements (): Observable<TimeElement[]> {
    return this.httpClient.get<Array<TimeElement>>(this.url);
  }
  
  getTimeElementByID (id: number): Observable<TimeElement[]> {
    return this.httpClient.get<Array<TimeElement>>(this.url + "/" + id);
  }

  postTimeElement(zeitElement: TimeElement): Observable<TimeElement>{
    return this.httpClient.post<TimeElement>(this.url, zeitElement);
  }

  putTimeElement(zeitElement: TimeElement): Observable<TimeElement>{
    return this.httpClient.put<TimeElement>(this.url + "/" + zeitElement.id, zeitElement);
  }

  deleteTimeElement(zeitElement: number): Observable<TimeElement>{
    return this.httpClient.delete<TimeElement>(this.url + "/" + zeitElement);
  }
}