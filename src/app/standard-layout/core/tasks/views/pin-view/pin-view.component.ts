import {
  Component,
  OnInit,
  Input,
  HostListener,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  Output,
} from '@angular/core';
import { Task } from '../../model/task';
import { TimeService } from 'src/app/standard-layout/shared/services/utils/time.service';
import { SettingsService } from 'src/app/standard-layout/shared/services/core/settings.service';
import { TaskService } from 'src/app/standard-layout/shared/services/core/task.service';
import {
  CountupTimerService,
  countUpTimerConfigModel,
  timerTexts,
} from 'ngx-timer';
import { KeyService } from 'src/app/standard-layout/shared/services/utils/key.service';
import {
  MatSnackBar,
  MatDialog,
  MatDatepickerInputEvent,
} from '@angular/material';
import { TimeTaskService } from 'src/app/standard-layout/shared/services/core/timetask.service';
import { UtilityService } from 'src/app/standard-layout/shared/services/utils/utility.service';
import { TimeTask } from '../../../timetask/model/timetask';
import { Settings } from '../../../settings/model/settings';
import { InsertTaskDialogComponent } from '../../dialogs/insert-task-dialog';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Color } from 'src/app/standard-layout/shared/model/Enums';

@Component({
  selector: 'app-pin-view',
  templateUrl: './pin-view.component.html',
  styleUrls: ['./pin-view.component.scss'],
})
export class PinViewComponent implements OnInit, OnChanges {
  @Input()
  public tasks: Task[];
  @Input()
  public tasksRunning: TimeTask[];
  @Input()
  public settings: Settings;
  @Output()
  public reload = new EventEmitter<void>();

  public testConfig: countUpTimerConfigModel;

  public tasksPinned: Task[];
  public tasksUnpinned: Task[];
  public displayUnpinned: boolean;
  public selectedTask: Task;
  private cachedTask: Task;

  // ng model
  public id: number;
  public shortDescription: string;
  public longDescription: string;
  public date: Date;
  public dateString: string;

  readonly Color = Color;

  constructor(
    public timeService: TimeService,
    public settingsService: SettingsService,
    public taskService: TaskService,
    public timerService: CountupTimerService,
    public keyService: KeyService,
    public utilityService: UtilityService,
    public dialogService: MatDialog,
    public timeTaskService: TimeTaskService,
    private snackBarService: MatSnackBar
  ) {}

  /**
   * Create new task dialog when shift is pressed and the mouse
   * is clicked at the same time
   * @param event occurs as mouse event
   */
  @HostListener('click', ['$event'])
  onShiftMouseClick(event: MouseEvent) {
    if (event.shiftKey) {
      this.openInsertTaskDialog();
    }
  }

  /**
   * The webpage will reload only when all tasks are saved
   * and the timer ist not running
   */
  @HostListener('window:beforeunload')
  onBeforeUnload() {
    return (
      this.taskService.allSaved(this.tasks) && !this.timerService.isTimerStart
    );
  }

  ngOnInit() {
    this.setTimerConfiguration();
  }

  ngOnChanges() {
    if (this.tasks && this.settings) {
      this.onTaskCategoriesChange();
      this.onSettingsChange();
    }
  }

  private setTimerConfiguration() {
    this.testConfig = new countUpTimerConfigModel();
    this.testConfig.timerClass = 'test_Timer_class';
    this.testConfig.timerTexts = new timerTexts();
    this.testConfig.timerTexts.hourText = ' h -';
    this.testConfig.timerTexts.minuteText = ' min -';
    this.testConfig.timerTexts.secondsText = ' s';
  }

  private onTaskCategoriesChange() {
    of(this.tasks)
      .pipe(
        tap((tasks) => {
          this.tasksUnpinned = this.taskService.retrieveUnpinnedAndUnHidedTasks(
            tasks
          );
          this.tasksPinned = this.taskService.retrievePinnedTasks(tasks);
        })
      )
      .subscribe();
  }

  private onSettingsChange() {
    of(this.settings)
      .pipe(
        tap((settings) => {
          this.displayUnpinned = settings.task.showUnpinnedTasks.value;
        })
      )
      .subscribe();
  }

  public saveTask(task: Task) {
    this.hideSelectedTask();

    if (!this.taskService.isSaved(task)) {
      // save task
      this.taskService.putTask(task).subscribe(() => {
        this.displayNotification(
          this.keyService.getKeyTranslation('ta7'),
          null
        );
        this.reload.emit();
      });
    } else {
      // already saved
      this.displayNotification(this.keyService.getKeyTranslation('a4'), null);
    }
  }

  public pinTask(task: Task) {
    this.cacheChangedTask(task);

    task.pinned = !task.pinned;
    this.updateTask(task, this.keyService.getKeyTranslation('ta6'), 'Reset');
  }

  public hideTask(task: Task) {
    this.cacheChangedTask(task);

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
      this.hideSelectedTask();

      this.displayNotification(notificationMessage, notificationAction);
      this.reload.emit();
    });
  }

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
      this.displayNotification(
        this.keyService.getKeyTranslation('ta3'),
        null
      );
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

  /**
   * Caches all properties from the task that will be changed
   * Can be used to 'undo' an action like delete, put, ..
   * @param fromTask has property value we maybe want back later
   */
  private cacheChangedTask(fromTask: Task) {
    this.cachedTask = Object.assign({}, fromTask);
  }

  /**
   * Change all abbreviations to text in the task description (based on ngModelChange)
   * @param task to be changed
   */
  public replaceWithShortcuts(task: Task) {
    Object.keys(this.keyService.getShortcuts()).forEach((key) => {
      task.longDescription = task.longDescription.replace(
        key,
        this.keyService.getShortcut(key)
      );
    });
  }

  public setBorderColor(task: Task): string {
    const actualDate: Date = this.timeService.createNewDate();
    const tempTaskDate: Date = new Date(task.date);
    const dayMilliseconds: number = 1000 * 60 * 60 * 24;

    if (
      this.selectedTask !== undefined &&
      this.selectedTask !== null &&
      this.selectedTask.id === task.id
    ) {
      // Selected task
      return this.keyService.getColor(Color.BLUE);
    } else if (
      actualDate.getTime() <
      tempTaskDate.getTime() - dayMilliseconds * 30
    ) {
      // More than 30 days
      return this.keyService.getColor(Color.CYAN);
    } else if (
      actualDate.getTime() >
      tempTaskDate.getTime() + dayMilliseconds
    ) {
      // More than one day
      return this.keyService.getColor(Color.RED);
    } else if (
      tempTaskDate.getDate() === actualDate.getDate() &&
      tempTaskDate.getMonth() === actualDate.getMonth() &&
      tempTaskDate.getFullYear() === actualDate.getFullYear()
    ) {
      // Today
      return this.keyService.getColor(Color.YELLOW);
    }

    // Standard colour
    return this.keyService.getColor(Color.GREEN);
  }

  /**
   * Create a task specific message about the deadline
   *
   * @param date when the task should be finished at all
   * @returns string description about the deadline of the task
   */
  public retrieveDeadlineMessageFromDate(date: Date): string {
    let diffInMilliseconds = this.timeService.calculateTimeDifferenceToCurrentDate(
      date
    );

    const beforeDeadline: boolean = diffInMilliseconds >= 0;

    if (!beforeDeadline) {
      diffInMilliseconds *= -1;
    }

    if (this.timeService.isToday(date)) {
      return '(Your deadline is today!)';
    }

    const days: number = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
    return !beforeDeadline
      ? `(~ ${days} day/s behind your goal)`
      : `(~ ${days} day/s until your deadline)`;
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
        shortDescription: '',
        longDescription: '',
        startDate: this.timeService.createNewDate(),
        endDate: null,
        running: true,
        project: task.project,
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

  public selectTask(task: Task) {
    if (this.selectedTask !== task) {
      this.selectedTask = task;
    } else {
      this.hideSelectedTask();
    }
  }

  public displayUnpinnedTasks() {
    this.displayUnpinned = !this.displayUnpinned;
  }

  private hideSelectedTask() {
    this.selectedTask = null;
  }

  public changeDateFromTask(event: MatDatepickerInputEvent<Date>) {
    this.selectedTask.date = event.value;
  }

  /**
   * Popup dialog for creating a new task with different parameters
   */
  openInsertTaskDialog() {
    this.hideSelectedTask();

    const dialog = this.dialogService.open(InsertTaskDialogComponent, {
      width: '250px',
      data: {
        shortDescription: this.shortDescription,
        longDescription: this.longDescription,
        date: this.date,
      },
    });

    dialog.afterClosed().subscribe((result) => {
      if (result === undefined) {
        return;
      }

      if (result.date === undefined) {
        result.date = this.timeService.createNewDate();
      }

      result.hided = false;
      result.pinned = false;

      if (this.shortDescription !== '' && this.longDescription !== '') {
        this.taskService.postTask(result).subscribe(() => {
          this.displayNotification(
            this.keyService.getKeyTranslation('ta2'),
            null
          );
          this.reload.emit();
        });
      }
    });
  }

  /**
   * Opens popup menu to show new notifications on user interface
   *
   * @param message to be displayed
   * @param action to be taken
   */
  private displayNotification(message: string, action: string) {
    this.snackBarService
      .open(message, action, {
        duration: 4000,
      })
      .onAction()
      .subscribe(() => {
        this.resetTask(this.cachedTask);
      });
  }
}
