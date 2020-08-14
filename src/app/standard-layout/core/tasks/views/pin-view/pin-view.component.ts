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
import { Title } from '@angular/platform-browser';
import { UtilityService } from 'src/app/standard-layout/shared/services/utils/utility.service';
import { TimeTask } from '../../../timetask/model/timetask';
import { Settings } from '../../../settings/model/settings';
import { InsertTaskDialog } from '../../dialogs/insert-task-dialog';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-pin-view',
  templateUrl: './pin-view.component.html',
  styleUrls: ['./pin-view.component.scss'],
})
export class PinViewComponent implements OnInit, OnChanges {
  @Input()
  tasks: Task[];
  @Input()
  tasksRunning: TimeTask[];
  @Input()
  settings: Settings[];
  @Output()
  public reload = new EventEmitter<void>();

  tasksPinned: Task[];
  tasksUnpinned: Task[];
  displayUnpinned: boolean;

  selectedTask: Task;
  lastChangedTask: Task;

  runningTimeTask: TimeTask;
  testConfig: countUpTimerConfigModel;

  id: number;
  shortdescr: string;
  longdescr: string;
  date: Date;
  dateString: string;

  constructor(
    public timeService: TimeService,
    public settingsService: SettingsService,
    public taskService: TaskService,
    public timerService: CountupTimerService,
    public keyService: KeyService,
    public utilityService: UtilityService,
    public dialogService: MatDialog,
    private timeTaskService: TimeTaskService,
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

  ngOnChanges(_changes: SimpleChanges) {
    if (this.tasks && this.settings && this.tasksRunning) {
      this.onTaskCategoriesChange();
      this.onSettingsChange();
      this.setRunningTaskWhenisTimerStarted();
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
          this.tasksUnpinned = this.taskService.retrieveUnpinnedAndUnhidedTasks(
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
          this.displayUnpinned = this.settingsService.getSettingsValue(
            settings,
            'Show unpinned Tasks'
          );
        })
      )
      .subscribe();
  }

  private setRunningTaskWhenisTimerStarted() {
    if (this.timerService.isTimerStart) {
      this.runningTimeTask = this.tasksRunning[0];
    }
  }

  /**
   * Change all abbreviations to text in the task description (based on ngModelChange)
   * @param task to be changed
   */
  public replaceWithShortcuts(task: Task) {
    Object.keys(this.keyService.getShortcuts()).forEach((key) => {
      task.longdescr = task.longdescr.replace(
        key,
        this.keyService.getShortcut(key)
      );
    });
  }

  public getStatusColorValue(task: Task): string {
    const actualDate: Date = this.timeService.createNewDate();
    const tempTaskDate: Date = new Date(task.date);
    const dayMilliseconds: number = 1000 * 60 * 60 * 24;

    if (
      this.selectedTask !== undefined &&
      this.selectedTask !== null &&
      this.selectedTask.id === task.id
    ) {
      // Selected task
      return this.keyService.getColor('blue');
    } else if (
      actualDate.getTime() <
      tempTaskDate.getTime() - dayMilliseconds * 30
    ) {
      // More than 30 days
      return this.keyService.getColor('cyan');
    } else if (
      actualDate.getTime() >
      tempTaskDate.getTime() + dayMilliseconds
    ) {
      // More than one day
      return this.keyService.getColor('red');
    } else if (
      tempTaskDate.getDate() === actualDate.getDate() &&
      tempTaskDate.getMonth() === actualDate.getMonth() &&
      tempTaskDate.getFullYear() === actualDate.getFullYear()
    ) {
      // Today
      return this.keyService.getColor('yellow');
    }

    // Standard colour
    return this.keyService.getColor('darkgreen');
  }

  // ====================================================================================================
  // ====================================================================================================
  // ====================================================================================================
  // ====================================================================================================

  // TODO rework method
  saveTask(task: Task) {
    if (task !== undefined) {
      if (this.utilityService.isNumber(task.id)) {
        if (this.taskService.isSaved(task)) {
          this.displayNotification(
            this.keyService.getKeyTranslation('a4'),
            null
          );
          this.hideSelectedTask();
          return;
        }
        this.taskService.putTask(task).subscribe(() => {
          this.displayNotification(
            this.keyService.getKeyTranslation('ta7'),
            null
          );
          this.reload.emit();
        });
      } else {
        console.warn('saveTask(): ID: ' + task.id + ', expected number');
      }
    } else {
      console.warn('saveTask(): ID: ' + task.id + ', expected ID');
    }

    this.hideSelectedTask();
  }

  // TODO rework method
  pinTask(task: Task) {
    if (task !== undefined) {
      if (this.utilityService.isNumber(task.id)) {
        this.copyTaskPropertiesToLastChangedTask(task);
        task.pinned = !task.pinned;
        this.updateTask(
          task,
          this.keyService.getKeyTranslation('ta6'),
          'Reset'
        );
      } else {
        console.warn('pinTask(): ID: ' + task.id + ', expected number');
      }
    } else {
      console.warn('pinTask(): ID: ' + task.id + ', expected ID');
    }
  }

  // TODO rework method
  hideTask(task: Task) {
    if (task !== undefined) {
      if (this.utilityService.isNumber(task.id)) {
        this.copyTaskPropertiesToLastChangedTask(task);
        task.hided = !task.hided;
        task.pinned = false;
        this.updateTask(
          task,
          this.keyService.getKeyTranslation('ta5'),
          'Reset'
        );
      } else {
        console.warn(`hideTask(): ID: ${task.id}, expected number`);
      }
    } else {
      console.warn(`hideTask(): ID: ${task.id}, expected id`);
    }
  }

  // TODO rework method
  removeTask(task: Task) {
    if (task !== undefined) {
      if (this.utilityService.isNumber(task.id)) {
        if (!window.confirm(this.keyService.getKeyTranslation('a11'))) {
          return;
        }
        this.taskService.deleteTask(task.id).subscribe(() => {
          this.displayNotification(
            this.keyService.getKeyTranslation('ta3'),
            null
          );
          this.reload.emit();
        });
      } else {
        console.warn(`removeTask(): ID: ${task.id}, expected number`);
      }
    } else {
      console.warn(`removeTask(): ID: ${task.id}, expected id`);
    }
  }

  // TODO rework method
  resetTask(task: Task) {
    if (task !== undefined) {
      if (this.utilityService.isNumber(task.id)) {
        this.updateTask(task, this.keyService.getKeyTranslation('ta4'), null);
      } else {
        console.warn(`resetTask(): ID: ${task.id}, expected number`);
      }
    } else {
      console.warn(`resetTask(): ID: ${task.id}, expected id`);
    }
  }

  // TODO rework method
  private updateTask(
    task: Task,
    notificationMessage: string,
    notificationAction: string
  ) {
    this.taskService.putTask(task).subscribe(() => {
      this.displayNotification(notificationMessage, notificationAction);
      this.reload.emit();
      this.hideSelectedTask();
    });
  }

  /**
   * Copy all properties from the current task to the last changed task
   * Can be used to 'undo' an action like delete, put, ..
   * @param fromTask has proprty value we mayb want back later
   */
  private copyTaskPropertiesToLastChangedTask(fromTask: Task) {
    this.lastChangedTask = {
      id: fromTask.id,
      date: fromTask.date,
      hided: fromTask.hided,
      pinned: fromTask.pinned,
      shortdescr: fromTask.shortdescr,
      longdescr: fromTask.longdescr,
      templongdescr: fromTask.templongdescr,
      tempshortdescr: fromTask.tempshortdescr,
      tempDate: fromTask.tempDate,
      project: fromTask.project,
    };
  }

  // TODO rework method
  startTimeTask(task: Task): void {
    if (this.runningTimeTask) {
      this.runningTimeTask.enddate = this.timeService.createNewDate();
      this.runningTimeTask.running = false;

      this.timeTaskService.putTimeTask(this.runningTimeTask).subscribe(() => {
        this.displayNotification(
          this.keyService.getKeyTranslation('ti62'),
          null
        );
      });

      this.resetTimer();
    }

    const date = this.timeService.createNewDate();
    const title = task.shortdescr;
    const empty = '';

    const timeTask: TimeTask = {
      id: 0,
      title: title,
      shortdescr: title,
      longdescr: empty,
      startdate: date,
      enddate: null,
      running: true,
    };

    this.timeTaskService.postTimeTask(timeTask).subscribe((data) => {
      this.timerService.startTimer();
      this.runningTimeTask = data;
    });
  }

  // TODO rework method
  stopTimeTask(): void {
    if (this.timerService.isTimerStart) {
      this.resetTimer();

      this.runningTimeTask.enddate = this.timeService.createNewDate();
      this.runningTimeTask.running = false;

      this.timeTaskService.putTimeTask(this.runningTimeTask).subscribe(() => {
        this.displayNotification(
          this.keyService.getKeyTranslation('ti4'),
          null
        );
        this.runningTimeTask = null;
      });
    } else {
      this.displayNotification(this.keyService.getKeyTranslation('ti61'), null);
    }
  }

  // TODO rework method
  /**
   * Popup dialog for creating a new task with different parameters
   */
  openInsertTaskDialog() {
    this.hideSelectedTask();

    const dialogRef = this.dialogService.open(InsertTaskDialog, {
      width: '250px',
      data: {
        shortdescr: this.shortdescr,
        longdescr: this.longdescr,
        date: this.date,
      },
    });

    dialogRef.afterClosed().subscribe((postResult) => {
      if (postResult !== undefined) {
        if (postResult.date === undefined) {
          postResult.date = this.timeService.createNewDate();
        }

        postResult.hide = false;
        postResult.pinned = false;

        if (this.shortdescr !== '' && this.longdescr !== '') {
          this.taskService.postTask(postResult).subscribe(() => {
            this.displayNotification(
              this.keyService.getKeyTranslation('ta2'),
              null
            );
            this.reload.emit();
          });
        } else {
          console.warn(
            'dialogRef.afterClosed(): ID: ' +
              postResult +
              ', expected that all fields arent empty'
          );
        }
      } else {
        console.warn(
          'dialogRef.afterClosed(): postResult: ' +
            postResult +
            ', expected postResult'
        );
      }
    });
  }

  public selectTask(task: Task) {
    if (this.selectedTask === undefined || this.selectedTask === null) {
      this.selectedTask = task;
    } else {
      this.hideSelectedTask();
    }
  }

  private hideSelectedTask() {
    this.selectedTask = null;
  }

  public changeDateFromTask(event: MatDatepickerInputEvent<Date>) {
    this.selectedTask.date = event.value;
  }

  public displayUnpinnedTasks() {
    this.displayUnpinned = !this.displayUnpinned;
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
  private displayNotification(message: string, action: string) {
    this.snackBarService
      .open(message, action, {
        duration: 4000,
      })
      .onAction()
      .subscribe(() => {
        this.resetTask(this.lastChangedTask);
      });
  }
}
