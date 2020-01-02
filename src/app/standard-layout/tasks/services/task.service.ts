import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../model/task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  url = "http://localhost:3000/tasks";

  constructor(private httpClient: HttpClient) { }

  getAllTasks (): Observable<Task[]> {
    return this.httpClient.get<Array<Task>>(this.url);
  }
  
  getTaskByID (id: number): Observable<Task[]> {
    return this.httpClient.get<Array<Task>>(this.url + "/" + id);
  }

  postTask(task: Task): Observable<Task>{
    return this.httpClient.post<Task>(this.url, task);
  }

  putTask(task: Task): Observable<Task>{
    return this.httpClient.put<Task>(this.url + "/" + task.id, task);
  }

  deleteTask(taskID: number): Observable<Task>{
    return this.httpClient.delete<Task>(this.url + "/" + taskID);
  }
}
