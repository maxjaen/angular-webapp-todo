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
import { NameAndNumberPair } from '../../shared/model/GraphData';
import { NameAndStringPair } from '../../shared/model/GraphData';
import { GraphDataService } from '../../shared/services/utils/graph.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const EMPTY_STRING = '';

@Component({
  selector: 'app-timetask',
  templateUrl: './timetask.component.html',
  styleUrls: ['./timetask.component.scss'],
})
export class TimeTaskComponent implements OnInit {
  @ViewChild('fast') inputElement: ElementRef;
  fastCreation = false;

  testConfig: countUpTimerConfigModel;
  settings: Settings[] = [];

  todayTimeElements: TimeTask[];
  allTimeElements: TimeTask[];
  runningTimeElement: TimeTask;
  selectedTimeElement: TimeTask;
  historyElements: TimeTask[];

  accumulatedSecondsPerTask: NameAndNumberPair[] = [];
  accumulatedElements: NameAndStringPair[] = [];
  historyAccumulatedElements: NameAndStringPair[] = [];
  graphData: NameAndNumberPair[] = [];
  graphDataHistory: NameAndNumberPair[] = [];

  id: number;
  shortdescr: string;
  longdescr: string;
  startdate: Date;
  enddate: Date;

  // TODO timerservice doesn't show correct time in google chrome, when tab inactive
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
    this.tabTitleService.setTitle(this.keyService.getString('ti1'));
  }

  ngOnInit() {
    this.getSettingsFromService();
    this.getTimeElementsFromService();
    this.setTimerConfig();
  }

  /*
   * ===================================================================================
   * HOSTLISTENER
   * ===================================================================================
   */

  @HostListener('click', ['$event'])
  onMouseClick(event: MouseEvent) {
    if (event.shiftKey) {
      this.openInsertDialog();
    }
  }

  @HostListener('window:beforeunload')
  onBeforeUnload() {
    return !this.timerService.isTimerStart;
  }

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(
    event: KeyboardEvent
  ) {
    this.manageFastCreation();
  }

  /*
   * ===================================================================================
   * CRUD OPERATIONS
   * ===================================================================================
   */

  /*
   * Get all settings from service
   */
  getSettingsFromService() {
    this.settingsService.getAllSettings().subscribe((settings) => {
      this.settings = settings;
    });
  }

  /*
   * Get all TimeTasks from service
   * Fill particular arrays with a subset of all TimeTasks
   */
  getTimeElementsFromService() {
    this.allTimeElements = []; // all TimeTasks from database
    this.todayTimeElements = []; // all TimeTasks from today
    this.historyElements = []; // browse your history for prior TimeTasks

    this.timeTaskService.getAllTimeElements().subscribe((data) => {
      this.allTimeElements = data;

      this.initTodayTimeElements();
      this.initAccumulationProcess();

      if (this.timerService.isTimerStart) {
        if (this.todayTimeElements.length > 0) {
          this.runningTimeElement = this.todayTimeElements[0];
        }
      }
    });
  }

  /*
   * ===================================================================================
   * INIT
   * ===================================================================================
   */

  private initTodayTimeElements() {
    this.todayTimeElements = this.timeTaskService.getTodayTimeTasks(
      this.allTimeElements
    );
  }

  private initAccumulationProcess() {
    this.accumulatedSecondsPerTask = this.timeTaskService.getAccumulatedTimeTaskAndSecondsPairs(
      this.todayTimeElements.filter((e) => this.timeTaskService.isValid(e))
    );

    this.accumulatedElements = this.initAccumulatedTaskData(
      this.accumulatedSecondsPerTask
    );
    this.graphData = this.graphDataService.initGraphDataForAccumulatedNameAndNumberValuePair(
      this.accumulatedSecondsPerTask
    );
  }

  private initAccumulatedTaskData(pair: NameAndNumberPair[]) {
    const arr: NameAndStringPair[] = [];

    pair.forEach((e) => {
      const element: NameAndStringPair = {
        name: e.name,
        value: this.timeService.formatMillisecondsToString(e.value),
      };
      arr.push(element);
    });
    return arr;
  }

  /*
   * Load history data from history elements
   */
  initHistoryData() {
    const accumulatedInSeconds = this.timeTaskService.getAccumulatedTimeTaskAndSecondsPairs(
      this.historyElements
    );

    this.historyAccumulatedElements = this.initAccumulatedTaskData(
      accumulatedInSeconds
    );
    this.graphDataHistory = this.graphDataService.initGraphDataForAccumulatedNameAndNumberValuePair(
      accumulatedInSeconds
    );
  }

  // ===================================================================================
  // CRUD OPERATIONS
  // ===================================================================================

  /**
   * Create new TimeTask with fastCreation (press esc)
   * @param event when pressing enter after addign text to fast selection
   */
  newTimeTask(event: any) {
    const date = this.timeService.createNewDate();
    const title = event.target.value;
    const empty = '';

    if (this.timerService.isTimerStart) {
      this.runningTimeElement.enddate = this.timeService.createNewDate();
      this.timeTaskService
        .putTimeElement(this.runningTimeElement)
        .subscribe(() => {
          this.getTimeElementsFromService();
        });
    }
    this.resetTimer();

    const timeTask: TimeTask = {
      id: 0,
      title: title,
      shortdescr: title,
      longdescr: empty,
      startdate: date,
      enddate: null,
    };

    this.timeTaskService.postTimeElement(timeTask).subscribe((data) => {
      this.getTimeElementsFromService();
      this.runningTimeElement = data;
      this.hideSelectedTimeElement();
      this.startTimer();
    });
  }

  /**
   * Create a new TimeTask from an already finished TimeTask
   * @param timeElement to continue
   */
  continueTimeElement(timeElement: TimeTask) {
    if (!window.confirm(this.keyService.getString('a12'))) {
      return;
    }

    if (this.timerService.isTimerStart) {
      this.runningTimeElement.enddate = this.timeService.createNewDate();
      this.enddate.setHours(this.enddate.getHours() + 1);
      this.timeTaskService
        .putTimeElement(this.runningTimeElement)
        .subscribe(() => {
          this.getTimeElementsFromService();
        });
    }
    this.resetTimer();

    const tempTimeElement: TimeTask = {
      id: null,
      title: timeElement.title,
      shortdescr: timeElement.shortdescr,
      longdescr: timeElement.longdescr,
      startdate: this.timeService.createNewDate(),
      enddate: null,
      task: timeElement.task,
    };

    this.timeTaskService.postTimeElement(tempTimeElement).subscribe((data) => {
      this.getTimeElementsFromService();
      this.runningTimeElement = data;
      this.hideSelectedTimeElement();
      this.startTimer();
    });
  }

  /**
   * Save TimeTask in the database
   * @param timeElement to save
   */
  saveTimeElement(timeElement: TimeTask) {
    if (timeElement !== undefined) {
      if (this.utilityService.isNumber(timeElement.id)) {
        this.timeTaskService.putTimeElement(timeElement).subscribe(() => {
          this.openSnackBar(this.keyService.getString('ti2'), null);
          this.getTimeElementsFromService();
        });
      } else {
        console.warn(
          `saveTimeElement(): ID: ${timeElement.id}, expected number`
        );
      }
    } else {
      console.warn(`saveTimeElement(): ID: ${timeElement.id}, expected id`);
    }

    this.hideSelectedTimeElement();
  }

  /**
   * Save all TimeTasks in the database
   */
  saveAllTimeElements() {
    this.todayTimeElements.forEach((element) => {
      this.saveTimeElement(element);
    });
  }

  /**
   * Remove selected TimeTask from the database
   * @param timeElement to remove
   */
  removeTimeElement(timeElement: TimeTask) {
    if (
      timeElement === undefined ||
      !this.utilityService.isNumber(timeElement.id)
    ) {
      return;
    }

    if (!window.confirm(this.keyService.getString('a11'))) {
      return;
    }

    if (
      this.runningTimeElement !== undefined &&
      this.runningTimeElement !== null &&
      timeElement.id === this.runningTimeElement.id
    ) {
      this.openSnackBar(this.keyService.getString('a23'), null);
      return;
    }

    this.timeTaskService.deleteTimeElement(timeElement.id).subscribe(() => {
      this.openSnackBar(this.keyService.getString('a23'), null);
      this.getTimeElementsFromService();
      this.hideSelectedTimeElement();
    });
  }

  /**
   * Delete all elements from choosen Date
   */
  deleteAllAvailableTimeTasks() {
    if (!window.confirm(this.keyService.getString('a11'))) {
      return;
    }

    this.historyElements.forEach((e) => {
      this.timeTaskService.deleteTimeElement(e.id).subscribe(() => {
        this.openSnackBar(this.keyService.getString('ti3'), null);
        this.getTimeElementsFromService();
        this.hideSelectedTimeElement();
      });
    });

    this.historyElements = null;
    this.historyAccumulatedElements = null;
  }

  /*
   * ===================================================================================
   * OTHER TIMETASK OPERATIONS
   * ===================================================================================
   */

  /*
   * Selected current TimeElement if not already set,
   * otherwise hide current selected TimeElement
   */
  selectTimeElement(timeElement: TimeTask) {
    if (
      this.selectedTimeElement === undefined ||
      this.selectedTimeElement === null
    ) {
      this.selectedTimeElement = timeElement;
    } else {
      this.hideSelectedTimeElement();
    }
  }

  /*
   * Remove selected TimeElement
   */
  hideSelectedTimeElement() {
    this.selectedTimeElement = null;
  }

  /*
   * Set the current running timeElement
   */
  selectRunningTimeElement(timeElement: TimeTask) {
    this.runningTimeElement = timeElement;
  }

  /*
   * Remove running TimeElement
   */
  hideRunningTimeElement() {
    this.runningTimeElement = null;
  }

  /*
   * ===================================================================================
   * TIMER
   * ===================================================================================
   */

  /*
   * Start timer service and set tab name
   */
  startTimer() {
    this.timerService.startTimer();
    this.tabTitleService.setTitle(this.keyService.getString('a3'));
  }

  /*
   * Finish the current TimeTask and reset the Timer
   * Add enddate property to TimeElement in the database
   * Triggered with finish button
   */
  finishTimer() {
    if (this.timerService.isTimerStart) {
      this.resetTimer();
      this.runningTimeElement.enddate = this.timeService.createNewDate();
      this.timeTaskService
        .putTimeElement(this.runningTimeElement)
        .subscribe(() => {
          this.hideRunningTimeElement();
          this.hideSelectedTimeElement();
          this.openSnackBar(this.keyService.getString('ti4'), null);
          this.getTimeElementsFromService();
        });
    }
  }

  /*
   * Reset timer back to the start
   */
  resetTimer() {
    this.timerService.stopTimer();
    this.timerService.setTimervalue(0);
    this.tabTitleService.setTitle(this.keyService.getString('ti1'));
  }

  /*
   * Set timer configuration with each init
   */
  setTimerConfig() {
    this.testConfig = new countUpTimerConfigModel();
    this.testConfig.timerClass = 'test_Timer_class';
    this.testConfig.timerTexts = new timerTexts();
    this.testConfig.timerTexts.hourText = ' h -';
    this.testConfig.timerTexts.minuteText = ' min -';
    this.testConfig.timerTexts.secondsText = ' s';
  }

  /*
   * ===================================================================================
   * DIALOGS/POPUPS
   * ===================================================================================
   */

  /*
   * Open popup dialog to create a new TimeTask
   * Finish current TimeTask if still running
   * Add new TimeElement to the database
   */
  openInsertDialog(): void {
    if (this.timerService.isTimerStart) {
      this.runningTimeElement.enddate = this.timeService.createNewDate();
      this.timeTaskService
        .putTimeElement(this.runningTimeElement)
        .subscribe(() => {
          this.openSnackBar(this.keyService.getString('ti2'), null);
          // this.hideSelectedTimeElement();
          this.getTimeElementsFromService();
        });
    }
    this.resetTimer();
    this.hideSelectedTimeElement();
    this.hideRunningTimeElement();

    const dialogRef = this.dialog.open(InsertTaskDialogTime, {
      width: '250px',
      data: {
        shortdescr: this.shortdescr,
        longdescr: this.longdescr,
      },
    });

    dialogRef.afterClosed().subscribe((resultFromDialog) => {
      if (resultFromDialog !== undefined) {
        resultFromDialog.startdate = this.timeService.createNewDate();
        this.selectRunningTimeElement(resultFromDialog);

        if (
          this.shortdescr !== EMPTY_STRING &&
          this.longdescr !== EMPTY_STRING
        ) {
          this.timeTaskService
            .postTimeElement(resultFromDialog)
            .subscribe((resultFromPost) => {
              this.openSnackBar(this.keyService.getString('ti5'), null);
              this.getTimeElementsFromService();
              this.runningTimeElement.id = resultFromPost.id;
              this.resetTimer();
              this.startTimer();
            });
        } else {
          console.warn(
            'dialogRef.afterClosed(): ID: ' +
              this.id +
              ', expected that all fields arent empty'
          );
        }
      } else {
        console.warn(
          'dialogRef.afterClosed(): resultFromDialog: ' +
            resultFromDialog +
            ', expected resultFromDialog'
        );
      }
    });
  }

  /*
   * Change start hour and start minutes of a TimeTask
   */
  changeStartDate(timeElement: TimeTask) {
    const amazingTimePicker = this.timePickerService.open();
    amazingTimePicker.afterClose().subscribe((time) => {
      const temp: Date = this.timeService.createNewDate();
      const timePickerResult: string[] = time.split(':');

      timeElement.startdate = new Date(
        temp.getFullYear(),
        temp.getMonth(),
        temp.getDate(),
        +timePickerResult[0], // hour
        +timePickerResult[1] // min
      );
    });
  }

  /*
   * Change end hour and end minutes of a TimeTask
   */
  changeEndDate(timeElement: TimeTask) {
    const amazingTimePicker = this.timePickerService.open();
    amazingTimePicker.afterClose().subscribe((time) => {
      const temp: Date = this.timeService.createNewDate();
      const timePickerResult: string[] = time.split(':');

      timeElement.enddate = new Date(
        temp.getFullYear(),
        temp.getMonth(),
        temp.getDate(),
        +timePickerResult[0], // hour
        +timePickerResult[1] // min
      );
    });
  }

  /*
   * Get all TimeElements start at the specific date based on the parameter
   * Returns history of TimeElements for a day
   */
  selectDate(event: { value: string }) {
    const str: string[] = event.value.split(',');
    const dateArray: string[] = str[0].split('.');
    const day: string = dateArray[0];
    const month: string = dateArray[1];
    const year: string = dateArray[2];

    this.historyElements = this.allTimeElements.filter((e) => {
      const date: Date = new Date(e.startdate);

      return (
        date.getDate() === +day &&
        date.getMonth() === +month - 1 &&
        date.getFullYear() === +year
      );
    });

    this.initHistoryData();
  }

  /*
   * Unfocus fastCreation html element when not active
   */
  unfocusAfterClick() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  /*
   * ===================================================================================
   * HELPER FUNCTIONS
   * ===================================================================================
   */

  /*
   * Opens popup menu for notifications
   */
  openSnackBar(message: string, action: string) {
    this.snackBarService.open(message, action, {
      duration: 4000,
    });
  }

  /*
   * Create time view string from TimeTask
   */
  timeElementToTimestring(timeElement: TimeTask): string {
    return this.timeService.formatMillisecondsToString(
      new Date(timeElement.enddate).getTime() -
        new Date(timeElement.startdate).getTime()
    );
  }

  /*
   * Get backround color for different types of TimeTasks
   * Return backround color
   */
  getStatusColorValue(timeTask: TimeTask): string {
    if (
      this.runningTimeElement !== undefined &&
      this.runningTimeElement !== null &&
      this.runningTimeElement.id === timeTask.id
    ) {
      return this.keyService.getColor('yellow');
    }

    if (
      this.selectedTimeElement !== undefined &&
      this.selectedTimeElement !== null &&
      this.selectedTimeElement.id === timeTask.id
    ) {
      return this.keyService.getColor('blue');
    }

    if (timeTask !== undefined && timeTask !== null && !timeTask.enddate) {
      return this.keyService.getColor('red');
    }

    return this.keyService.getColor('darkgreen');
  }

  /*
   * Change all abbreviations to text in the task description (based on ngModelChange)
   */
  replaceWithShortcut(timeTask: TimeTask) {
    Object.keys(this.keyService.getShortcuts()).forEach((key) => {
      timeTask.longdescr = timeTask.longdescr.replace(
        key,
        this.keyService.getShortcut(key)
      );
    });
  }

  /*
   * Negate fastCreation value when pressing esc
   * Focus or unfocus html element when not activating/deactivating
   */
  manageFastCreation() {
    this.fastCreation = !this.fastCreation;

    setTimeout(() => {
      // this will make the execution after the above boolean has changed
      this.inputElement.nativeElement.focus();
    }, 0);

    if (!this.fastCreation) {
      this.inputElement.nativeElement.value = '';
      this.unfocusAfterClick();
    }
  }

  // Get distinct dates of all TimeTasks
  // Returns array of distinct dates
  selectDistinctDates(): Array<string> {
    const tempDates: Date[] = [];
    this.allTimeElements.forEach((timeElement) => {
      if (
        !tempDates.find((date) => {
          const DateToInsert: Date = new Date(timeElement.startdate);
          const insertedDate: Date = new Date(date);
          return (
            insertedDate.getDate() === DateToInsert.getDate() &&
            insertedDate.getMonth() === DateToInsert.getMonth() &&
            insertedDate.getFullYear() === DateToInsert.getFullYear()
          );
        })
      ) {
        tempDates.push(timeElement.startdate);
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
          this.timeService.createDayString(date.getDay())
        );
      });
  }
}
