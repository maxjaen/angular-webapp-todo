import { Injectable } from '@angular/core';
import { Task } from 'src/app/standard-layout/core/tasks/model/task';

@Injectable({
    providedIn: 'root',
})
export class CacheService {

    private cachedTask: Task;

    constructor() {}

    /**
     * Caches all properties from the task that will be changed.
     * Can be used to 'undo' actions like delete, put, etc.
     *
     * @param fromTask has property value we maybe want back later
     */
    public setCachedTask(fromTask: Task) {
        this.cachedTask = Object.assign({}, fromTask);
    }

    /**
     * Returns the cached task from the object store.
     *
     * @returns The cached task will be returned.
     */
    public getCachedTask(): Task {
        return this.cachedTask;
    }
}
