import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Task } from "../model/task";

@Injectable({
  providedIn: "root",
})
export class TaskService {
  url = "http://localhost:3000/tasks";

  constructor(private httpClient: HttpClient) {}

  /*
   * ===================================================================================
   * CRUD TASK OPERATIONS
   * ===================================================================================
   */

  getAllTasks(): Observable<Task[]> {
    return this.httpClient.get<Array<Task>>(this.url);
  }

  getTaskByID(id: number): Observable<Task[]> {
    return this.httpClient.get<Array<Task>>(this.url + "/" + id);
  }

  postTask(task: Task): Observable<Task> {
    return this.httpClient.post<Task>(this.url, task);
  }

  putTask(task: Task): Observable<Task> {
    return this.httpClient.put<Task>(this.url + "/" + task.id, task);
  }

  deleteTask(taskID: number): Observable<Task> {
    return this.httpClient.delete<Task>(this.url + "/" + taskID);
  }

  /*
   * ===================================================================================
   * OTHER TASK OPERATIONS
   * ===================================================================================
   */

  getPinnedTasks(tasks: Task[]): Task[] {
    return tasks
      .filter((e) => this.isPinned(e))
      .sort(function (a, b) {
        return Date.parse(a.date.toString()) - Date.parse(b.date.toString());
      });
  }

  getUnpinnedTasks(tasks: Task[]): Task[] {
    return tasks
      .filter((e) => this.isUnpinned(e))
      .sort(function (a, b) {
        return Date.parse(a.date.toString()) - Date.parse(b.date.toString());
      });
  }

  getHidedTasks(tasks: Task[]): Task[] {
    return tasks
      .filter((e) => this.isHided(e))
      .sort(function (a, b) {
        return Date.parse(a.date.toString()) - Date.parse(b.date.toString());
      })
      .reverse();
  }

  isPinned(task: Task): boolean {
    return task.pinned ? true : false;
  }

  isUnpinned(task: Task): boolean {
    return !task.pinned && !task.hided ? true : false;
  }

  isHided(task: Task): boolean {
    return task.hided ? true : false;
  }

  isSelectedTask(task: Task, selectedTask: Task): boolean {
    return task === selectedTask ? true : false;
  }

  isSaved(task: Task): boolean {
    return task.longdescr === task.templongdescr ? true : false;
  }

  allSaved(tasks: Task[]): boolean {
    return tasks.every((e) => this.isSaved(e)) ? true : false;
  }

  strFromTask(task: Task): string {
    return new Date(task.date).toUTCString();
  }

  countUnsavedTasks(tasks: Task[]): number {
    return tasks.filter((e) => !this.isSaved(e)).length;
  }
}
