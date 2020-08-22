import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../../../core/tasks/model/task';
import { UtilityService } from '../utils/utility.service';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private url = 'http://localhost:3000/tasks';

  constructor(
    private utilityService: UtilityService,
    private httpClient: HttpClient
  ) {}

  public getTasks(): Observable<Task[]> {
    return this.httpClient.get<Array<Task>>(this.url);
  }

  public getTaskByID(id: number): Observable<Task[]> {
    return this.httpClient.get<Array<Task>>(this.url + '/' + id);
  }

  public postTask(task: Task): Observable<Task> {
    return this.httpClient.post<Task>(this.url, task);
  }

  public putTask(task: Task): Observable<Task> {
    return this.httpClient.put<Task>(this.url + '/' + task.id, task);
  }

  public deleteTask(taskID: number): Observable<Task> {
    return this.httpClient.delete<Task>(this.url + '/' + taskID);
  }

  /**
   * @param tasks to filter for pinned tasks and sorted
   * @returns numerically sorted pinned tasks
   */
  public retrievePinnedTasks(tasks: Task[]): Task[] {
    return tasks
      .filter(this.isPinned)
      .sort((a, b) =>
        this.utilityService.sortNumerical(
          Date.parse(a.date.toString()),
          Date.parse(b.date.toString())
        )
      );
  }

  /**
   * @param tasks to filter for unpinned and unHided tasks
   * @returns numerically sorted unpinned and unHided tasks
   */
  public retrieveUnpinnedAndUnHidedTasks(tasks: Task[]): Task[] {
    return tasks
      .filter((e) => !this.isPinned(e) && !this.isHided(e))
      .sort((a, b) =>
        this.utilityService.sortNumerical(
          Date.parse(a.date.toString()),
          Date.parse(b.date.toString())
        )
      );
  }

  /**
   * @param tasks to filter for hided tasks
   * @returns numerically sorted hided tasks
   */
  public retrieveHidedTasks(tasks: Task[]): Task[] {
    return tasks
      .filter(this.isHided)
      .sort((a, b) =>
        this.utilityService.sortNumerical(
          Date.parse(a.date.toString()),
          Date.parse(b.date.toString())
        )
      );
  }

  /**
   * @param task to extract utc string from
   * @return utc string from task date
   */
  public extractUtcStringFromTask(task: Task): string {
    return new Date(task.date).toUTCString();
  }

  public isSaved(task: Task): boolean {
    return (
      task.shortDescription === task.tempShortDescription &&
      task.longDescription === task.tempLongDescription &&
      task.date === task.tempDate
    );
  }

  public allSaved(tasks: Task[]): boolean {
    return tasks.every(this.isSaved);
  }

  public countUnsavedTasks(tasks: Task[]): number {
    return tasks.filter((e) => !this.isSaved(e)).length;
  }

  private isPinned(task: Task): boolean {
    return task.pinned;
  }

  private isHided(task: Task): boolean {
    return task.hided;
  }
}
