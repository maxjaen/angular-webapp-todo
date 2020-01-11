import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { TimeTask } from "../model/timetask";

@Injectable({
  providedIn: "root"
})
export class TimeTaskService {
  url = "http://localhost:3000/timetasks";

  constructor(private httpClient: HttpClient) {}

  getAllTimeElements(): Observable<TimeTask[]> {
    return this.httpClient.get<Array<TimeTask>>(this.url);
  }

  getTimeElementByID(id: number): Observable<TimeTask[]> {
    return this.httpClient.get<Array<TimeTask>>(this.url + "/" + id);
  }

  postTimeElement(zeitElement: TimeTask): Observable<TimeTask> {
    return this.httpClient.post<TimeTask>(this.url, zeitElement);
  }

  putTimeElement(zeitElement: TimeTask): Observable<TimeTask> {
    return this.httpClient.put<TimeTask>(
      this.url + "/" + zeitElement.id,
      zeitElement
    );
  }

  deleteTimeElement(zeitElement: number): Observable<TimeTask> {
    return this.httpClient.delete<TimeTask>(this.url + "/" + zeitElement);
  }
}
