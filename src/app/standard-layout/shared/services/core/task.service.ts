import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Task } from "../../../core/tasks/model/task";
import { UtilityService } from "../utils/utility.service";

@Injectable({
  providedIn: "root",
})
export class TaskService {
  url = "http://localhost:3000/tasks";

  constructor(
    private utilityService: UtilityService,
    private httpClient: HttpClient
  ) {}

  // ===================================================================================
  // CRUD TASK OPERATIONS
  // ===================================================================================

  public getAllTasks(): Observable<Task[]> {
    return this.httpClient.get<Array<Task>>(this.url);
  }

  public getTaskByID(id: number): Observable<Task[]> {
    return this.httpClient.get<Array<Task>>(this.url + "/" + id);
  }

  public postTask(task: Task): Observable<Task> {
    return this.httpClient.post<Task>(this.url, task);
  }

  public putTask(task: Task): Observable<Task> {
    return this.httpClient.put<Task>(this.url + "/" + task.id, task);
  }

  public deleteTask(taskID: number): Observable<Task> {
    return this.httpClient.delete<Task>(this.url + "/" + taskID);
  }

  // ===================================================================================
  // FILTER TASK OPERATIONS
  // ===================================================================================

  public filterAndSortToPinnedTasks(tasks: Task[]): Task[] {
    return tasks
      .filter(this.isPinned)
      .sort((a, b) =>
        this.utilityService.sortNumerical(
          Date.parse(a.date.toString()),
          Date.parse(b.date.toString())
        )
      );
  }

  public filterAndSortToUnpinnedAndUnhidedTasks(tasks: Task[]): Task[] {
    return tasks
      .filter((e) => !this.isPinned(e) && !this.isHided(e))
      .sort((a, b) =>
        this.utilityService.sortNumerical(
          Date.parse(a.date.toString()),
          Date.parse(b.date.toString())
        )
      );
  }

  public getHidedTasks(tasks: Task[]): Task[] {
    return tasks
      .filter(this.isHided)
      .sort((a, b) =>
        this.utilityService.sortNumerical(
          Date.parse(a.date.toString()),
          Date.parse(b.date.toString())
        )
      );
  }

  // ===================================================================================
  // TEST TASK OPERATIONS
  // ===================================================================================

  /*
   * Checks if the input task as parameter is pinned
   */
  private isPinned(task: Task): boolean {
    return task.pinned;
  }

  /*
   * Checks if the input task as parameter is hided
   */
  private isHided(task: Task): boolean {
    return task.hided;
  }

  /*
   * Checks if the input task as parameter is saved
   */
  public isSaved(task: Task): boolean {
    return (
      task.shortdescr === task.tempshortdescr &&
      task.longdescr === task.templongdescr &&
      task.date === task.tempDate
    );
  }

  /*
   * Checks if every input task in array as parameter is saved
   */
  public allSaved(tasks: Task[]): boolean {
    return tasks.every(this.isSaved);
  }

  /*
   * Gets task as parameter
   * Returns UTCString the date of the task
   */
  public utcStringFromTask(task: Task): string {
    return new Date(task.date).toUTCString();
  }

  /*
   * Counts all unsaved tasks
   */
  public countUnsavedTasks(tasks: Task[]): number {
    return tasks.filter((e) => !this.isSaved(e)).length;
  }
}
