import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Task } from '../../model/task';
import { TimeTask } from '../../../timetask/model/timetask';
import { Settings } from '../../../settings/model/settings';
import { SettingsService } from 'src/app/standard-layout/shared/services/core/settings.service';
import { TaskService } from 'src/app/standard-layout/shared/services/core/task.service';
import { tap, map } from 'rxjs/operators';
import { TimeTaskService } from 'src/app/standard-layout/shared/services/core/timetask.service';
import { KeyService } from 'src/app/standard-layout/shared/services/utils/key.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { CacheService } from 'src/app/standard-layout/shared/services/utils/cache.service';
import {
    CountupTimerService,
    countUpTimerConfigModel,
    timerTexts,
} from 'ngx-timer';
import { newDate } from 'src/app/standard-layout/shared/utils/TimeUtils';
import { sortDistinct } from 'src/app/standard-layout/shared/utils/CommonUtils';
import { NotificationService } from 'src/app/standard-layout/shared/services/utils/notification.service';

@Component({
    selector: 'app-project-view',
    templateUrl: './project-view.component.html',
    styleUrls: ['./project-view.component.scss'],
})
export class ProjectViewComponent implements OnInit {

    @Input()
    public tasks: Task[];
    @Output()
    public reload = new EventEmitter<void>();
    @Input()
    private settings: Settings[];
    // TODO: Why is this value not used?
    @Input()
    private tasksRunning: TimeTask[];

    public testConfig: countUpTimerConfigModel;

    constructor(
        public timeTaskService: TimeTaskService,
        public settingsService: SettingsService,
        public taskService: TaskService,
        private timerService: CountupTimerService,
        private notificationService: NotificationService,
        private keyService: KeyService,
        private cacheService: CacheService
    ) {}

    ngOnInit() {
        this.loadFromServices();
        this.setTimerConfiguration();
    }

    public loadFromServices() {
        this.initTasks();
        this.initTimeTasks();
        this.initSettings();
    }

    /**
     * Change the property 'hide' of the given task to be hided.
     *
     * @param task The task that will not be shown to the user anymore.
     */
    public hideTask(task: Task) {
        this.cacheService.setCachedTask(task);

        task.hided = !task.hided;
        task.pinned = false;
        this.updateTask(
            task,
            this.keyService.getKeyTranslation('ta5'),
            'Reset'
        );
    }

    /**
     * Duplicate a task within the database.
     */
    public duplicateTask(task: Task) {
        const tempTask: Task = {
            id: 0,
            shortDescription: task.shortDescription,
            tempShortDescription: task.tempShortDescription,
            longDescription: task.longDescription,
            tempLongDescription: task.tempLongDescription,
            date: task.date,
            tempDate: task.tempDate,
            hided: task.hided,
            pinned: task.pinned,
            project: task.project,
        };

        this.taskService.postTask(tempTask).subscribe(() => {
            this.notificationService.displayNotification(
                this.keyService.getKeyTranslation('ta3'),
                null
            );
            this.reload.emit();
        });
    }

    /**
     * Remove a task from the database.
     */
    public removeTask(task: Task) {
        if (window.confirm(this.keyService.getKeyTranslation('a11'))) {
            this.taskService.deleteTask(task.id).subscribe(() => {
                this.notificationService.displayNotification(
                    this.keyService.getKeyTranslation('ta3'),
                    null
                );
                this.reload.emit();
            });
        }
    }

    /**
     * Reset a task to its previous state.
     *
     * @param task The task that should be changed to its previous state.
     */
    public resetTask(task: Task) {
        this.updateTask(task, this.keyService.getKeyTranslation('ta4'), null);
    }

    /**
     * Retrieve the distinct names of all possible projects sorted by name.
     *
     * @param tasks All tasks that will be assigned to a project.
     * @returns Return the distinct names of all possible projects sorted by name.
     */
    public retrieveDistinctProjectNames(tasks: Task[]): string[] {
        return tasks
            .map((e) => e.project)
            .filter(sortDistinct)
            .sort();
    }

    /**
     * Retrieve all tasks for a given project.
     *
     * @param project The project that should contain a few tasks.
     * @returns Returns a task array from the specified project.
     */
    public retrieveProjectTasks(project: string): Task[] {
        return this.tasks.filter((task) => task.project === project);
    }

    /**
     * Checks if the the task from the arguments is the currently running task.
     */
    public isRunningTask(task: Task): boolean {
        return (
            task.shortDescription === this.timeTaskService.runningTimeTask.title
        );
    }

    /**
     * Checks if the given project id is the same as of the currently running task.
     *
     * @param projectId The project id to be checked.
     * @returns Return true if the currently running timetask has the same project
     * id, otherwise false.
     */
    public isProjectGroupOfRunningTask(projectId: string): boolean {
        const task = this.tasks.filter(
            (e) =>
                e.shortDescription ===
                this.timeTaskService.runningTimeTask.title
        )[0];

        return task && task.project === projectId;
    }

    /**
     * TODO: Check method and adapt documentation!
     * Normally the timetask feature is in a different component but we want
     * to click as little as possible at the frontend to be productive. So we need
     * a small hint about the running clock in the tasks component too!
     * That means we integrate the timetask feature into the task component
     * even when there is another timetask component
     */
    public startTimeTaskFeature(task: Task): void {
        this.saveTask();
        this.resetTimer();

        this.timeTaskService
            .postTimeTask({
                id: 0,
                title: task.shortDescription,
                shortDescription: task.shortDescription,
                longDescription: '',
                startDate: newDate(),
                endDate: null,
                running: true,
                project: task.project,
            })
            .subscribe((timeTask) => {
                this.timerService.startTimer();
                this.timeTaskService.runningTimeTask = timeTask;
            });
    }

    /**
     * TODO: Check method and create documentation!
     */
    public stopTimeTaskFeature(): void {
        if (this.timerService.isTimerStart) {
            this.resetTimer();

            this.timeTaskService.runningTimeTask.endDate = newDate();
            this.timeTaskService.runningTimeTask.running = false;

            this.timeTaskService
                .putTimeTask(this.timeTaskService.runningTimeTask)
                .subscribe(() => {
                    this.notificationService.displayNotification(
                        this.keyService.getKeyTranslation('ti4'),
                        null
                    );

                    this.timeTaskService.runningTimeTask = null;
                });
        } else {
            this.notificationService.displayNotification(
                this.keyService.getKeyTranslation('ti61'),
                null
            );
        }
    }

    /**
     * Gives the user the ability to drag and drop different tasks into other
     * project groups.
     *
     * @param event The drag and drop event for the project.
     */
    public dropTaskInGroup(event: CdkDragDrop<string[]>) {
        if (event.previousContainer.id !== event.container.id) {
            this.tasks
                .filter((task) => task.id === event.item.data.id)
                .forEach((filteredTask) => {
                    filteredTask.project = event.container.id;
                });

            this.updateTask(event.item.data, 'Group of task updated.', null);
        }
    }

    private initTasks() {
        this.taskService
            .getTasks()
            .pipe(
                map((tasks) => tasks.filter((task) => !task.hided)),
                tap((tasks) => {
                    tasks.forEach((task) => {
                        task.tempShortDescription = task.shortDescription;
                        task.tempLongDescription = task.longDescription;
                        task.tempDate = task.date;
                    });
                })
            )
            .subscribe((tasks) => {
                this.tasks = tasks;
            });
    }

    private initTimeTasks() {
        this.timeTaskService
            .getTimeTasks()
            .pipe(
                map((timeTasks) =>
                    timeTasks.filter(
                        (timeTask) =>
                            timeTask.running === true && !timeTask.endDate
                    )
                )
            )
            .subscribe((timeTasks) => {
                this.tasksRunning = timeTasks;
            });
    }

    private initSettings() {
        this.settingsService.getSettings().subscribe((settings) => {
            this.settings = settings;
        });
    }

    private saveTask() {
        if (this.timeTaskService.runningTimeTask) {
            this.timeTaskService.runningTimeTask.endDate = newDate();
            this.timeTaskService.runningTimeTask.running = false;

            this.timeTaskService
                .putTimeTask(this.timeTaskService.runningTimeTask)
                .subscribe(() => {
                    this.notificationService.displayNotification(
                        this.keyService.getKeyTranslation('ti62'),
                        null
                    );
                });
        }
    }

    private updateTask(task: Task, message: string, action: string) {
        this.taskService.putTask(task).subscribe(() => {
            this.notificationService.displayNotification(
                message,
                action
            );

            this.reload.emit();
        });
    }

    private resetTimer() {
        this.timerService.stopTimer();
        this.timerService.setTimervalue(0);
    }

    private setTimerConfiguration() {
        this.testConfig = new countUpTimerConfigModel();
        this.testConfig.timerClass = 'test_Timer_class';
        this.testConfig.timerTexts = new timerTexts();
        this.testConfig.timerTexts.hourText = ' h -';
        this.testConfig.timerTexts.minuteText = ' min -';
        this.testConfig.timerTexts.secondsText = ' s';
    }
}
