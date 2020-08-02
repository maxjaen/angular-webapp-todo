import {
  Component,
  OnInit,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TaskService } from '../../shared/services/core/task.service';
import { InsertTaskDialog } from './dialogs/insert-task-dialog';
import { Task } from './model/task';
import { MatDatepickerInputEvent, MatSnackBar } from '@angular/material';
import { Title } from '@angular/platform-browser';
import { KeyService } from '../../shared/services/utils/key.service';
import { UtilityService } from '../../shared/services/utils/utility.service';
import { Settings } from '../settings/model/settings';
import { SettingsService } from '../../shared/services/core/settings.service';
import { TimeService } from '../../shared/services/utils/time.service';
import { TimeTaskService } from '../../shared/services/core/timetask.service';
import {
  CountupTimerService,
  countUpTimerConfigModel,
  timerTexts,
} from 'ngx-timer';
import { TimeTask } from '../timetask/model/timetask';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
})
export class TasksComponent implements OnInit {
  @ViewChild('fast') inputElement: ElementRef;
  fastCreation = false;

  settings: Settings[];
  displayUnpinned: boolean;

  tasks: Task[];
  pinnedTasks: Task[];
  unpinnedTasks: Task[];
  hidedTasks: Task[];

  selectedTask: Task;
  focusedTask: Task;
  lastChangedTask: Task;

  runningTimeElement: TimeTask;
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
    private tabTitleService: Title,
    private timeTaskService: TimeTaskService,
    private snackBarService: MatSnackBar
  ) {}

  ngOnInit() {
    this.initTasksFromService();
    this.initSettingsFromService();
    this.initRunningTimeElement();
    this.setTimerConfig();
  }

  setTimerConfig() {
    this.testConfig = new countUpTimerConfigModel();
    this.testConfig.timerClass = 'test_Timer_class';
    this.testConfig.timerTexts = new timerTexts();
    this.testConfig.timerTexts.hourText = ' h -';
    this.testConfig.timerTexts.minuteText = ' min -';
    this.testConfig.timerTexts.secondsText = ' s';
  }

  @HostListener('click', ['$event'])
  onShiftMouseClick(event: MouseEvent) {
    if (event.shiftKey) {
      this.openInsertTaskDialog();
    }
  }

  @HostListener('window:beforeunload')
  onBeforeUnload() {
    return (
      this.taskService.allSaved(this.tasks) && !this.timerService.isTimerStart
    );
  }

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(
    event: KeyboardEvent
  ) {
    this.manageFastCreation();
  }

  // Init all Tasks from service
  // Fill three lists with a subset of these TimeElements
  initTasksFromService() {
    this.taskService.getTasks().subscribe((e) => {
      this.tasks = e;

      this.tasks.forEach((f) => {
        f.tempshortdescr = f.shortdescr;
        f.templongdescr = f.longdescr;
        f.tempDate = f.date;
      });

      this.unpinnedTasks = this.taskService.retrieveUnpinnedAndUnhidedTasks(
        this.tasks
      );
      this.pinnedTasks = this.taskService.retrievePinnedTasks(this.tasks);
      this.hidedTasks = this.taskService.retrieveHidedTasks(this.tasks);

      this.setTabTitle();
    });
  }

  // Init all settings from service
  initSettingsFromService() {
    this.settingsService.getAllSettings().subscribe((settings) => {
      this.settings = settings;

      this.displayUnpinned = this.settingsService.getSettingsValue(
        settings,
        'Show unpinned Tasks'
      );
    });
  }

  initRunningTimeElement() {
    this.timeTaskService.getTimeElements().subscribe((data) => {
      const timeTask = data.filter((e) => e.running === true)[0];

      if (this.timerService.isTimerStart && !timeTask.enddate) {
        this.runningTimeElement = timeTask;
      }
    });
  }

  newTask(event: any) {
    const date = this.timeService.createNewDate();
    const shortDescr = event.target.value;
    const longDescr = '';

    const task: Task = {
      id: 0,
      shortdescr: shortDescr,
      tempshortdescr: shortDescr,
      longdescr: longDescr,
      templongdescr: longDescr,
      date: date,
      tempDate: date,
      hided: false,
      pinned: true,
    };

    if (this.shortdescr !== '' && this.longdescr !== '') {
      this.taskService.postTask(task).subscribe(() => {
        this.displayNotification(
          this.keyService.getKeyTranslation('ta2'),
          null
        );
        this.initTasksFromService();
      });
    }
  }

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
          this.initTasksFromService();
        });
      } else {
        console.warn('saveTask(): ID: ' + task.id + ', expected number');
      }
    } else {
      console.warn('saveTask(): ID: ' + task.id + ', expected ID');
    }

    this.hideSelectedTask();
  }

  saveAllTasks() {
    this.tasks.forEach((element) => {
      this.saveTask(element);
    });
  }

  pinTask(task: Task) {
    if (task !== undefined) {
      if (this.utilityService.isNumber(task.id)) {
        this.copyTaskPropertiesToLastChangedTask(task);
        task.pinned = !task.pinned;
        this.putTask(task, this.keyService.getKeyTranslation('ta6'), 'Reset');
      } else {
        console.warn('pinTask(): ID: ' + task.id + ', expected number');
      }
    } else {
      console.warn('pinTask(): ID: ' + task.id + ', expected ID');
    }
  }

  hideTask(task: Task) {
    if (task !== undefined) {
      if (this.utilityService.isNumber(task.id)) {
        this.copyTaskPropertiesToLastChangedTask(task);
        task.hided = !task.hided;
        task.pinned = false;
        this.putTask(task, this.keyService.getKeyTranslation('ta5'), 'Reset');
      } else {
        console.warn(`hideTask(): ID: ${task.id}, expected number`);
      }
    } else {
      console.warn(`hideTask(): ID: ${task.id}, expected id`);
    }
  }

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
          this.initTasksFromService();
        });
      } else {
        console.warn(`removeTask(): ID: ${task.id}, expected number`);
      }
    } else {
      console.warn(`removeTask(): ID: ${task.id}, expected id`);
    }
  }

  resetTask(task: Task) {
    if (task !== undefined) {
      if (this.utilityService.isNumber(task.id)) {
        this.putTask(task, this.keyService.getKeyTranslation('ta4'), null);
      } else {
        console.warn(`resetTask(): ID: ${task.id}, expected number`);
      }
    } else {
      console.warn(`resetTask(): ID: ${task.id}, expected id`);
    }
  }

  // Execute put action on task and following commands
  putTask(task: Task, notificationMessage: string, notificationAction: string) {
    this.taskService.putTask(task).subscribe(() => {
      this.displayNotification(notificationMessage, notificationAction);
      this.initTasksFromService();
      this.hideSelectedTask();
    });
  }

  // Selected current Task if not already set,
  // otherwise hide current selected Task
  selectTask(task: Task) {
    if (this.selectedTask === undefined || this.selectedTask === null) {
      this.selectedTask = task;
    } else {
      this.hideSelectedTask();
    }
  }

  // Change pin property of a task in the database
  focusTask(task: Task) {
    if (this.focusedTask == null || this.focusedTask === undefined) {
      this.focusedTask = task;
    } else {
      this.focusedTask = null;
    }
  }

  // Remove selected Task
  hideSelectedTask() {
    this.selectedTask = null;
  }

  // Change target date of the selected task
  changeDateFromTask(event: MatDatepickerInputEvent<Date>) {
    this.selectedTask.date = event.value;
  }

  // Copy all properties from the current task to the last changed task
  // Can be used to 'undo' an action like delete, put, ..
  copyTaskPropertiesToLastChangedTask(fromTask: Task) {
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
    };
  }

  // Let browser display unpinned tasks or not
  displayUnpinnedTasks() {
    this.displayUnpinned = !this.displayUnpinned;
  }

  // Change all abbreviations to text in the task description (based on ngModelChange)
  replaceWithShortcut(task: Task) {
    Object.keys(this.keyService.getShortcuts()).forEach((key) => {
      task.longdescr = task.longdescr.replace(
        key,
        this.keyService.getShortcut(key)
      );
    });
  }

  getStatusColorValue(task: Task): string {
    const actualDate: Date = this.timeService.createNewDate();
    const tempTaskDate: Date = new Date(task.date);
    const dayMilliseconds: number = 1000 * 60 * 60 * 24;

    // Selected task
    if (
      this.selectedTask !== undefined &&
      this.selectedTask !== null &&
      this.selectedTask.id === task.id
    ) {
      return this.keyService.getColor('blue');
    }

    // More than 30 days
    if (actualDate.getTime() < tempTaskDate.getTime() - dayMilliseconds * 30) {
      return this.keyService.getColor('cyan');
    }

    // More than one day
    if (actualDate.getTime() > tempTaskDate.getTime() + dayMilliseconds) {
      return this.keyService.getColor('red');
    }

    // Today
    if (
      tempTaskDate.getDate() === actualDate.getDate() &&
      tempTaskDate.getMonth() === actualDate.getMonth() &&
      tempTaskDate.getFullYear() === actualDate.getFullYear()
    ) {
      return this.keyService.getColor('yellow');
    }

    // Standard colour
    return this.keyService.getColor('darkgreen');
  }

  manageFastCreation() {
    this.fastCreation = !this.fastCreation;

    setTimeout(() => {
      this.inputElement.nativeElement.focus();
    }, 0);

    if (!this.fastCreation) {
      this.inputElement.nativeElement.value = '';
      this.unfocusAfterClick();
    }
  }

  startTimeTask(task: Task): void {
    if (this.runningTimeElement) {
      this.runningTimeElement.enddate = this.timeService.createNewDate();
      this.runningTimeElement.running = false;

      this.timeTaskService
        .putTimeElement(this.runningTimeElement)
        .subscribe(() => {
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

    this.timeTaskService.postTimeElement(timeTask).subscribe((data) => {
      this.timerService.startTimer();
      this.runningTimeElement = data;
    });
  }

  stopTimeTask(): void {
    if (this.timerService.isTimerStart) {
      this.resetTimer();

      this.runningTimeElement.enddate = this.timeService.createNewDate();
      this.runningTimeElement.running = false;

      this.timeTaskService
        .putTimeElement(this.runningTimeElement)
        .subscribe(() => {
          this.displayNotification(
            this.keyService.getKeyTranslation('ti4'),
            null
          );
          this.runningTimeElement = null;
        });
    } else {
      this.displayNotification(this.keyService.getKeyTranslation('ti61'), null);
    }
  }

  private resetTimer() {
    this.timerService.stopTimer();
    this.timerService.setTimervalue(0);
  }

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

  // Set title for apllication window in browser
  setTabTitle(): void {
    if (this.pinnedTasks.length > 0) {
      this.tabTitleService.setTitle(
        this.keyService.getKeyTranslation('ta1') +
          ' (' +
          this.pinnedTasks.length.toString() +
          ')'
      );
    } else {
      this.tabTitleService.setTitle(this.keyService.getKeyTranslation('ta1'));
    }
  }

  unfocusAfterClick() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  // Open popup dialog to create a new Task
  // Hide selected task
  // Add new Task to the database
  openInsertTaskDialog(): void {
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
            this.initTasksFromService();
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
}
