import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { Task } from '../../model/task';
import { TimeTask } from '../../../timetask/model/timetask';
import { Settings } from '../../../settings/model/settings';
import { SettingsService } from 'src/app/standard-layout/shared/services/core/settings.service';
import { TaskService } from 'src/app/standard-layout/shared/services/core/task.service';
import { tap, map } from 'rxjs/operators';
import { TimeTaskService } from 'src/app/standard-layout/shared/services/core/timetask.service';
import { UtilityService } from 'src/app/standard-layout/shared/services/utils/utility.service';
import { MatSnackBar } from '@angular/material';
import { KeyService } from 'src/app/standard-layout/shared/services/utils/key.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { CacheService } from 'src/app/standard-layout/shared/services/utils/cache.service';
import {
  CountupTimerService,
  countUpTimerConfigModel,
  timerTexts,
} from 'ngx-timer';
import { TimeService } from 'src/app/standard-layout/shared/services/utils/time.service';

@Component({
  selector: 'app-project-view',
  templateUrl: './project-view.component.html',
  styleUrls: ['./project-view.component.scss'],
})
export class ProjectViewComponent implements OnInit {
  @Input()
  tasks: Task[];
  @Input()
  tasksRunning: TimeTask[];
  @Input()
  settings: Settings[];
  @Output()
  public reload = new EventEmitter<void>();

  public testConfig: countUpTimerConfigModel;

  constructor(
    public timeTaskService: TimeTaskService,
    public settingsService: SettingsService,
    public taskService: TaskService,
    private timerService: CountupTimerService,
    private timeService: TimeService,
    private utilityService: UtilityService,
    private snackBarService: MatSnackBar,
    private keyService: KeyService,
    private cacheService: CacheService
  ) {}

  ngOnInit() {
    this.loadFromServices();
    this.setTimerConfiguration();
  }

  private setTimerConfiguration() {
    this.testConfig = new countUpTimerConfigModel();
    this.testConfig.timerClass = 'test_Timer_class';
    this.testConfig.timerTexts = new timerTexts();
    this.testConfig.timerTexts.hourText = ' h -';
    this.testConfig.timerTexts.minuteText = ' min -';
    this.testConfig.timerTexts.secondsText = ' s';
  }

  public loadFromServices() {
    this.initTasks();
    this.initTimeTasks();
    this.initSettings();
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
            (timeTask) => timeTask.running === true && !timeTask.endDate
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

  public dropTaskInGroup(event: CdkDragDrop<string[]>) {
    if (event.previousContainer.id !== event.container.id) {
      this.tasks
        .filter((task) => task.id == event.item.data.id)
        .forEach((filteredTask) => {
          filteredTask.project = event.container.id;
        });

      this.updateTask(event.item.data, 'Group of task updated.', null);
    }
  }

  public hideTask(task: Task) {
    this.cacheService.setCachedTask(task);

    task.hided = !task.hided;
    task.pinned = false;
    this.updateTask(task, this.keyService.getKeyTranslation('ta5'), 'Reset');
  }

  private updateTask(
    task: Task,
    notificationMessage: string,
    notificationAction: string
  ) {
    this.taskService.putTask(task).subscribe(() => {
      this.displayNotification(notificationMessage, notificationAction);

      this.reload.emit();
    });
  }

  public removeTask(task: Task) {
    if (window.confirm(this.keyService.getKeyTranslation('a11'))) {
      // confirmed
      this.taskService.deleteTask(task.id).subscribe(() => {
        this.displayNotification(
          this.keyService.getKeyTranslation('ta3'),
          null
        );
        this.reload.emit();
      });
    }
  }

  public resetTask(task: Task) {
    this.updateTask(task, this.keyService.getKeyTranslation('ta4'), null);
  }

  public retrieveDistinctProjectNames(tasks: Task[]): string[] {
    return tasks
      .map((e) => e.project)
      .filter(this.utilityService.sortDistinct)
      .sort();
  }

  public retrieveTasksWithProject(project: string): Task[] {
    return this.tasks.filter((task) => task.project == project);
  }

  public isRunningTask(task: Task): boolean {
    return task.shortDescription === this.timeTaskService.runningTimeTask.title;
  }

  public isProjectGroupOfRunningTask(projectId: string): boolean {
    const task = this.tasks.filter(
      (e) => e.shortDescription == this.timeTaskService.runningTimeTask.title
    )[0];

    return task && task.project === projectId;
  }

  /**
   * Normally the timetask feature is in a different component but we want
   * to click as little as possible at the frontend to be productive. So we need a small hint about the running clock
   * in the tasks component too!
   * That means we integrate the timetask feature into the task component
   * even when there is another timetask component
   */
  public startTimeTaskFeature(task: Task): void {
    this.saveIfTaskIsRunning();
    this.resetTimer();

    this.timeTaskService
      .postTimeTask({
        id: 0,
        title: task.shortDescription,
        shortDescription: task.shortDescription,
        longDescription: '',
        startDate: this.timeService.createNewDate(),
        endDate: null,
        running: true,
      })
      .subscribe((timeTask) => {
        this.timerService.startTimer();
        this.timeTaskService.runningTimeTask = timeTask;
      });
  }

  private saveIfTaskIsRunning() {
    if (this.timeTaskService.runningTimeTask) {
      this.timeTaskService.runningTimeTask.endDate = this.timeService.createNewDate();
      this.timeTaskService.runningTimeTask.running = false;

      this.timeTaskService
        .putTimeTask(this.timeTaskService.runningTimeTask)
        .subscribe(() => {
          this.displayNotification(
            this.keyService.getKeyTranslation('ti62'),
            null
          );
        });
    }
  }

  public stopTimeTaskFeature(): void {
    if (this.timerService.isTimerStart) {
      this.resetTimer();

      this.timeTaskService.runningTimeTask.endDate = this.timeService.createNewDate();
      this.timeTaskService.runningTimeTask.running = false;

      this.timeTaskService
        .putTimeTask(this.timeTaskService.runningTimeTask)
        .subscribe(() => {
          this.displayNotification(
            this.keyService.getKeyTranslation('ti4'),
            null
          );

          this.timeTaskService.runningTimeTask = null;
        });
    } else {
      this.displayNotification(this.keyService.getKeyTranslation('ti61'), null);
    }
  }

  private resetTimer() {
    this.timerService.stopTimer();
    this.timerService.setTimervalue(0);
  }

  /**
   * Opens popup menu to show new notifications on user interface
   * @param message to be displayed
   * @param action to be taken
   */
  private displayNotification(message: string, action: string): void {
    this.snackBarService
      .open(message, action, {
        duration: 4000,
      })
      .onAction()
      .subscribe(() => {
        this.resetTask(this.cacheService.getCachedTask());
      });
  }
}
