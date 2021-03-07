import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../../../core/tasks/model/task';
import { sortNumerical } from '../../utils/CommonUtils';

const TASK_URL = 'http://localhost:3000/tasks';

@Injectable({
    providedIn: 'root',
})
export class TaskService {

    constructor(private httpClient: HttpClient) {}

    public getTasks(): Observable<Task[]> {
        return this.httpClient.get<Array<Task>>(TASK_URL);
    }

    public getTaskByID(id: number): Observable<Task[]> {
        return this.httpClient.get<Array<Task>>(TASK_URL + '/' + id);
    }

    public postTask(task: Task): Observable<Task> {
        return this.httpClient.post<Task>(TASK_URL, task);
    }

    public putTask(task: Task): Observable<Task> {
        return this.httpClient.put<Task>(TASK_URL + '/' + task.id, task);
    }

    public deleteTask(taskID: number): Observable<Task> {
        return this.httpClient.delete<Task>(TASK_URL + '/' + taskID);
    }

    /**
     * Retrieve all pinned tasks from the list of all tasks.
     *
     * @param tasks The task array that will be filtered for pinned tasks.
     * @returns Returns the pinned tasks in numerically order.
     */
    public retrievePinnedTasks(tasks: Task[]): Task[] {
        return tasks
            .filter(this.isPinned)
            .sort((a, b) =>
                sortNumerical(
                    Date.parse(a.date.toString()),
                    Date.parse(b.date.toString())
                )
            );
    }

    /**
     * Retrieve all tasks that are not hided and unpinned from the list of all
     * tasks.
     *
     * @param tasks The task array that will be filtered for not hided and
     * unpinned tasks.
     * @returns Returns the not hided and unpinned tasks in numerically order.
     */
    public retrieveUnpinnedAndUnHidedTasks(tasks: Task[]): Task[] {
        return tasks
            .filter((e) => !this.isPinned(e) && !this.isHided(e))
            .sort((a, b) =>
                sortNumerical(
                    Date.parse(a.date.toString()),
                    Date.parse(b.date.toString())
                )
            );
    }

    /**
     * Retrieve all hided tasks from the list of all tasks.
     *
     * @param tasks The task array that will be filtered for hided tasks.
     * @returns Returns the hided tasks in numerically order.
     */
    public retrieveHidedTasks(tasks: Task[]): Task[] {
        return tasks
            .filter(this.isHided)
            .sort((a, b) =>
                sortNumerical(
                    Date.parse(a.date.toString()),
                    Date.parse(b.date.toString())
                )
            );
    }

    /**
     * Extract the utc string from the tasks date.
     *
     * @param task The task that contains the date.
     * @return Return utc string from the tasks date.
     */
    public extractUtcStringFromTask(task: Task): string {
        return new Date(task.date).toUTCString();
    }

    /**
     * Checks if a task was successfully saved by the user.
     *
     * @param The task that should be saved.
     * @returns Return true if the task was saved, otherwise false.
     */
    public isSaved(task: Task): boolean {
        return (
            task.shortDescription === task.tempShortDescription &&
            task.longDescription === task.tempLongDescription &&
            task.date === task.tempDate
        );
    }

    /**
     * Checks that all tasks from the given array are saved.
     *
     * @param tasks The tasks that should be saved.
     * @returns Returns true if all tasks are saved, otherwise false.
     */
    public allSaved(tasks: Task[]): boolean {
        return tasks.every(this.isSaved);
    }

    /**
     * Calculates the number of unsaved tasks.
     *
     * @param tasks The task array that will be filtered for unsaved tasks.
     * @returns Return the number of unsaved tasks as integer value.
     */
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
