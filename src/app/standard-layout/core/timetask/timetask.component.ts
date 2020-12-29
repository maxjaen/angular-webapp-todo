import {
  Component,
  OnInit,
  HostListener,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { TimeTaskService } from '../../shared/services/core/timetask.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { TimeTask } from './model/timetask';
import { InsertTaskDialogTime } from './dialogs/insert-task-dialog';
import { countUpTimerConfigModel, timerTexts } from 'ngx-timer';
import { CountupTimerService } from 'ngx-timer';
import { Title } from '@angular/platform-browser';
import { UtilityService } from '../../shared/services/utils/utility.service';
import { AmazingTimePickerService } from 'amazing-time-picker';
import { KeyService } from '../../shared/services/utils/key.service';
import { TimeService } from '../../shared/services/utils/time.service';
import { SettingsService } from '../../shared/services/core/settings.service';
import { Settings } from '../settings/model/settings';
import { NumberValueGraph } from '../../shared/model/GraphData';
import { StringValueGraph } from '../../shared/model/GraphData';
import { GraphDataService } from '../../shared/services/utils/graph.service';
import { tap, map } from 'rxjs/operators';
import { Color, Period } from '../../shared/model/Enums';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-timetask',
  templateUrl: './timetask.component.html',
  styleUrls: ['./timetask.component.scss'],
})
export class TimeTaskComponent implements OnInit {
  @ViewChild('creationField') inputElement: ElementRef;
  showCreationField = false;

  testConfig: countUpTimerConfigModel;
  settings: Settings[] = [];

  selectedTimeTask: TimeTask;

  id: number;
  shortDescription: string;
  longDescription: string;
  startDate: Date;
  endDate: Date;

  // general
  timeTasks: TimeTask[] = [];

  // today
  timeTasksFromToday: TimeTask[] = [];
  accumulatedTasksFromToday: StringValueGraph[] = [];
  graphDataFromToday: NumberValueGraph[] = [];

  // history
  timeTasksFromHistory: TimeTask[] = [];
  accumulatedTasksFromHistory: StringValueGraph[] = [];
  graphDataFromHistory: NumberValueGraph[] = [];

  readonly Color = Color;

  constructor(
    public settingsService: SettingsService,
    public timeTaskService: TimeTaskService,
    public timerService: CountupTimerService,
    public dialog: MatDialog,
    public utilityService: UtilityService,
    public keyService: KeyService,
    public timeService: TimeService,
    private graphDataService: GraphDataService,
    private timePickerService: AmazingTimePickerService,
    private tabTitleService: Title,
    private snackBarService: MatSnackBar
  ) {
    this.tabTitleService.setTitle(this.keyService.getKeyTranslation('ti1'));
  }

  ngOnInit() {
    this.setTimerConfiguration();
    this.getSettings();
    this.getTimeTasksFromToday();
  }

  /**
   * Restarts website only if the timer is not running, otherwise
   * shows a dialog window
   */
  @HostListener('window:beforeunload')
  onBeforeUnload() {
    return !this.timerService.isTimerStart;
  }

  /**
   * Create new time task with shift and click on user interface
   * @param event when clicked
   */
  @HostListener('click', ['$event'])
  onMouseClick(event: MouseEvent) {
    if (event.shiftKey) {
      this.openInsertDialog();
    }
  }

  /**
   * Show window for faster creation of new time tasks
   * @param event when esc pressed
   */
  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler() {
    this.toggleFastCreation();
  }

  private setTimerConfiguration() {
    this.testConfig = new countUpTimerConfigModel();
    this.testConfig.timerClass = 'test_Timer_class';
    this.testConfig.timerTexts = new timerTexts();
    this.testConfig.timerTexts.hourText = ' h -';
    this.testConfig.timerTexts.minuteText = ' min -';
    this.testConfig.timerTexts.secondsText = ' s';
  }

  private getSettings() {
    this.settingsService.getSettings().subscribe((settings) => {
      this.settings = settings;
    });
  }

  private getTimeTasksFromToday() {
    this.timeTaskService
      .getTimeTasks()
      .pipe(
        tap((timeTasks) => (this.timeTasks = timeTasks)),
        map((timeTasks) => this.timeTaskService.retrieveFromToday(timeTasks)),
        tap((timeTasks) => {
          this.initAccumulationProcess(timeTasks, Period.TODAY);
        })
      )
      .subscribe((timeTasks) => {
        this.timeTasksFromToday = timeTasks;
      });
  }

  private getTimeTasksHistory(day: string, month: string, year: string) {
    this.timeTaskService
      .getTimeTasks()
      .pipe(
        map((timeTasks) =>
          timeTasks.filter((timeTask) =>
            this.timeTaskService.retrieveFromHistory(timeTask, day, month, year)
          )
        ),
        tap((timeTasks) => {
          this.initAccumulationProcess(timeTasks, Period.HISTORY);
        })
      )
      .subscribe((timeTasks) => {
        this.timeTasksFromHistory = timeTasks;
      });
  }

  /**
   * Get all time tasks started at the specific date based on the parameter
   * @param event when selecting time task from history on user interface
   */
  public selectDate(event: { value: string }) {
    const str: string[] = event.value.split(',');
    const dateArray: string[] = str[0].split('.');
    const day: string = dateArray[0];
    const month: string = dateArray[1];
    const year: string = dateArray[2];

    this.getTimeTasksHistory(day, month, year);
  }

  /**
   * Used to create accumulated graph data and description
   * @param timeTasks from today
   */
  private initAccumulationProcess(timeTasks: TimeTask[], period: Period) {
    const accumulatedInSeconds = this.timeTaskService.extractAccumulatedTimeTasks(
      timeTasks
    );
    const descriptionData = this.createAccumulationDescription(
      accumulatedInSeconds
    );
    const graphData = this.graphDataService.createAccumulationGraph(
      accumulatedInSeconds
    );

    if (period === Period.TODAY) {
      this.accumulatedTasksFromToday = descriptionData;
      this.graphDataFromToday = graphData;
    } else if (period === Period.HISTORY) {
      this.accumulatedTasksFromHistory = descriptionData;
      this.graphDataFromHistory = graphData;
    }
  }

  /**
   * Creates a key value pair with the task and the accumulated time in ms as formatted string
   * @param pair that includes every tasks and the accumulated time
   */
  private createAccumulationDescription(pair: NumberValueGraph[]) {
    return pair.map((entry) => {
      return {
        name: entry.name,
        value: this.timeService.formatMillisecondsToString(entry.value),
      };
    });
  }

  /**
   * Create new TimeTask with fastCreation (press esc)
   * @param event when pressing enter after adding text to fast selection
   */
  public createFastTimeTask(event: any) {
    const date = this.timeService.createNewDate();
    const title = event.target.value;
    const empty = '';

    if (this.timerService.isTimerStart) {
      this.timeTaskService.runningTimeTask.endDate = this.timeService.createNewDate();
      this.timeTaskService
        .putTimeTask(this.timeTaskService.runningTimeTask)
        .subscribe(() => {
          this.getTimeTasksFromToday();
        });
    }
    this.resetTimer();

    this.timeTaskService
      .postTimeTask({
        id: 0,
        title: title,
        shortDescription: title,
        longDescription: empty,
        startDate: date,
        endDate: null,
      })
      .subscribe((timeTask) => {
        this.getTimeTasksFromToday();
        this.timeTaskService.runningTimeTask = timeTask;
        this.hideSelectedTimeTask();
        this.startTimer();
      });
  }

  /**
   * Create a new TimeTask from an already finished TimeTask
   * @param timeTask to continue
   */
  public continueTimeTask(timeTask: TimeTask) {
    if (
      window.confirm(this.keyService.getKeyTranslation('a12')) && // confirm new task
      this.timerService.isTimerStart // timer is running
    ) {
      this.timeTaskService.runningTimeTask.endDate = this.timeService.createNewDate();
      this.timeTaskService
        .putTimeTask(this.timeTaskService.runningTimeTask)
        .subscribe(() => {
          this.getTimeTasksFromToday();
        });
    }
    this.resetTimer();

    this.timeTaskService
      .postTimeTask({
        id: null,
        title: timeTask.title,
        shortDescription: timeTask.shortDescription,
        longDescription: timeTask.longDescription,
        startDate: this.timeService.createNewDate(),
        endDate: null,
        task: timeTask.task,
      })
      .subscribe((timeTask) => {
        this.getTimeTasksFromToday();
        this.timeTaskService.runningTimeTask = timeTask;
        this.hideSelectedTimeTask();
        this.startTimer();
      });
  }

  /**
   * Save TimeTask in the database
   * @param timeTask to save
   */
  public saveTimeTask(timeTask: TimeTask) {
    if (isNullOrUndefined(timeTask)) {
      throw new Error(
        'saveTimeTask(): timeTask is not valid. Expected not null or not undefined.'
      );
    }
    if (!this.utilityService.isNumber(timeTask.id)) {
      throw new Error(
        'saveTimeTask(): timeTask id is not valid. Expected number.'
      );
    }

    this.timeTaskService.putTimeTask(timeTask).subscribe(() => {
      this.displayNotification(this.keyService.getKeyTranslation('ti2'), null);
      this.getTimeTasksFromToday();
      this.hideSelectedTimeTask();
    });
  }

  /**
   * Remove selected TimeTask from the database
   * @param timeTask to remove
   */
  public removeTimeElement(timeTask: TimeTask) {
    if (
      !isNullOrUndefined(timeTask) && // not undefined or null
      this.utilityService.isNumber(timeTask.id) && // is number
      !this.timeTaskService.isSame(
        timeTask,
        this.timeTaskService.runningTimeTask
      ) && // not running
      window.confirm(this.keyService.getKeyTranslation('a11')) // confirmed for deletion
    ) {
      this.timeTaskService.deleteTimeTask(timeTask.id).subscribe(() => {
        this.displayNotification(
          this.keyService.getKeyTranslation('a23'),
          null
        );
        this.getTimeTasksFromToday();
        this.hideSelectedTimeTask();
      });
    }
  }

  /**
   * Delete all elements from chosen Date
   */
  public deleteAllAvailableTimeTasks() {
    if (window.confirm(this.keyService.getKeyTranslation('a11'))) {
      this.timeTasksFromHistory.forEach((e) => {
        this.timeTaskService.deleteTimeTask(e.id).subscribe(() => {
          this.displayNotification(
            this.keyService.getKeyTranslation('ti3'),
            null
          );
          this.getTimeTasksFromToday();
          this.hideSelectedTimeTask();
        });
      });

      this.timeTasksFromHistory = null;
      this.accumulatedTasksFromHistory = null;
    }
  }

  /**
   * Selected current TimeTask if not already set,
   * otherwise hide current selected TimeTask
   * @param timeTask to be selected
   */
  public toggleSelection(timeTask: TimeTask) {
    if (this.selectedTimeTask === undefined || this.selectedTimeTask === null) {
      this.selectedTimeTask = timeTask;
    } else {
      this.hideSelectedTimeTask();
    }
  }

  private selectRunningTimeTask(timeTask: TimeTask) {
    this.timeTaskService.runningTimeTask = timeTask;
  }

  private hideSelectedTimeTask() {
    this.selectedTimeTask = null;
  }

  private hideRunningTimeTask() {
    this.timeTaskService.runningTimeTask = null;
  }

  private isRunningTimeTask(timeTask: TimeTask){
    return timeTask.id === this.timeTaskService.runningTimeTask.id;
  }

  private startTimer() {
    this.timerService.startTimer();
    this.tabTitleService.setTitle(this.keyService.getKeyTranslation('a3'));
  }

  public finishTimer() {
    if (this.timerService.isTimerStart) {
      this.resetTimer();
      this.timeTaskService.runningTimeTask.endDate = this.timeService.createNewDate();
      this.timeTaskService
        .putTimeTask(this.timeTaskService.runningTimeTask)
        .subscribe(() => {
          this.hideRunningTimeTask();
          this.hideSelectedTimeTask();
          this.displayNotification(
            this.keyService.getKeyTranslation('ti4'),
            null
          );
          this.getTimeTasksFromToday();
        });
    }
  }

  private resetTimer() {
    this.timerService.stopTimer();
    this.timerService.setTimervalue(0);
    this.tabTitleService.setTitle(this.keyService.getKeyTranslation('ti1'));
  }

  /**
   * Open popup dialog to create a new TimeTask
   * Finish current TimeTask if still running and add new TimeElement to the database
   */
  public openInsertDialog(): void {
    if (this.timerService.isTimerStart) {
      this.timeTaskService.runningTimeTask.endDate = this.timeService.createNewDate();
      this.timeTaskService
        .putTimeTask(this.timeTaskService.runningTimeTask)
        .pipe(
          tap(() => {
            this.getTimeTasksFromToday();
            this.displayNotification(
              this.keyService.getKeyTranslation('ti2'),
              null
            );
          })
        )
        .subscribe();
    }

    this.resetTimer();
    this.hideSelectedTimeTask();
    this.hideRunningTimeTask();

    const dialog = this.dialog.open(InsertTaskDialogTime, {
      width: '250px',
      data: {
        shortDescription: this.shortDescription,
        longDescription: this.longDescription,
      },
    });

    dialog.afterClosed().subscribe((resultFromDialog) => {
      if (resultFromDialog !== undefined) {
        resultFromDialog.startDate = this.timeService.createNewDate();
        this.selectRunningTimeTask(resultFromDialog);

        if (this.shortDescription !== '' && this.longDescription !== '') {
          this.timeTaskService
            .postTimeTask(resultFromDialog)
            .pipe(
              tap(() => {
                this.getTimeTasksFromToday();
                this.resetTimer();
                this.startTimer();
                this.displayNotification(
                  this.keyService.getKeyTranslation('ti5'),
                  null
                );
              })
            )
            .subscribe((resultFromPost) => {
              this.timeTaskService.runningTimeTask.id = resultFromPost.id;
            });
        }
      }
    });
  }

  /**
   * Change start hour and start minutes of a TimeTask
   * @param timeTask to be changed
   */
  public changeStartDate(timeTask: TimeTask) {
    const amazingTimePicker = this.timePickerService.open();
    amazingTimePicker.afterClose().subscribe((time) => {
      const temp: Date = this.timeService.createNewDate();
      const timePickerResult: string[] = time.split(':');

      const newDate = new Date(
        temp.getFullYear(),
        temp.getMonth(),
        temp.getDate(),
        +timePickerResult[0],
        +timePickerResult[1]
      );
      
      timeTask.startDate = newDate;
      if (this.isRunningTimeTask(timeTask)){
        this.timeTaskService.runningTimeTask.startDate = newDate;
      }
    });
  }

  /**
   * Change end hour and end minutes of a TimeTask
   * @param timeTask to be changed
   */
  public changeEndDate(timeTask: TimeTask) {
    const amazingTimePicker = this.timePickerService.open();
    amazingTimePicker.afterClose().subscribe((time) => {
      const temp: Date = this.timeService.createNewDate();
      const timePickerResult: string[] = time.split(':');

      timeTask.endDate = new Date(
        temp.getFullYear(),
        temp.getMonth(),
        temp.getDate(),
        +timePickerResult[0], // hour
        +timePickerResult[1] // min
      );
    });
  }

  /**
   * Get background color for different types of TimeTasks
   * @param timeTask to set the background color
   * @returns background color
   */
  public setBorderColor(timeTask: TimeTask): string {
    if (
      this.timeTaskService.isSame(
        timeTask,
        this.timeTaskService.runningTimeTask
      )
    ) {
      return this.keyService.getColor(Color.YELLOW);
    } else if (this.timeTaskService.isSame(timeTask, this.selectedTimeTask)) {
      return this.keyService.getColor(Color.BLUE);
    } else if (!this.timeTaskService.isValid(timeTask)) {
      return this.keyService.getColor(Color.RED);
    }

    return this.keyService.getColor(Color.DARKGREEN);
  }

  /**
   * Change all abbreviations to text in the task description (based on ngModelChange)
   * @param timeTask to be changed
   */
  public replaceWithShortcuts(timeTask: TimeTask) {
    Object.keys(this.keyService.getShortcuts()).forEach((key) => {
      timeTask.longDescription = timeTask.longDescription.replace(
        key,
        this.keyService.getShortcut(key)
      );
    });
  }

  /**
   * Opens window for fastCreation on user interface
   * Focus or unfocus html element when not activating/deactivating
   */
  private toggleFastCreation() {
    this.showCreationField = !this.showCreationField;

    setTimeout(() => {
      // this will make the execution after the above boolean has changed
      this.inputElement.nativeElement.focus();
    }, 0);

    if (!this.showCreationField) {
      this.inputElement.nativeElement.value = '';
      this.unFocusAfterClick();
    }
  }

  private unFocusAfterClick() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  /**
   * Get distinct dates of all TimeTasks
   * @returns array of distinct dates
   */
  public selectDistinctDates(): Array<string> {
    const tempDates: Date[] = [];
    this.timeTasks.forEach((timeTask) => {
      if (
        !tempDates.find((date) => {
          const DateToInsert: Date = new Date(timeTask.startDate);
          const insertedDate: Date = new Date(date);
          return (
            insertedDate.getDate() === DateToInsert.getDate() &&
            insertedDate.getMonth() === DateToInsert.getMonth() &&
            insertedDate.getFullYear() === DateToInsert.getFullYear()
          );
        })
      ) {
        tempDates.push(timeTask.startDate);
      }
    });

    return tempDates
      .sort((e) => new Date(e).getTime())
      .map((e) => {
        const date: Date = new Date(e);
        return (
          this.utilityService.formatToTwoDigits(date.getDate()) +
          '.' +
          this.utilityService.formatToTwoDigits(date.getMonth() + 1) +
          '.' +
          this.utilityService.formatToTwoDigits(date.getFullYear()) +
          ', ' +
          this.timeService.retrieveDayOfTheWeek(date.getDay())
        );
      });
  }

  public toString(timeTask: TimeTask): string {
    return this.timeService.formatMillisecondsToString(
      new Date(timeTask.endDate).getTime() -
        new Date(timeTask.startDate).getTime()
    );
  }

  /**
   * Opens popup menu to show new notifications on user interface
   * @param message to be displayed
   * @param action to be taken
   */
  private displayNotification(message: string, action: string) {
    this.snackBarService.open(message, action, {
      duration: 4000,
    });
  }
}
