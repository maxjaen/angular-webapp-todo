import { Component, OnInit, HostListener } from "@angular/core";
import { TimeTaskService } from "./services/timetask.service";
import { MatDialog, MatSnackBar } from "@angular/material";
import { TimeTask } from "./model/timetask";
import { InsertTaskDialogTime } from "./dialogs/insert-task-dialog";
import { countUpTimerConfigModel, timerTexts } from "ngx-timer";
import { CountupTimerService } from "ngx-timer";
import { Title } from "@angular/platform-browser";
import { UtilityService } from "../../shared/services/utility.service";
import { AmazingTimePickerService } from "amazing-time-picker";
import { KeyService } from "../../shared/services/key.service";
import { TimeService } from "../../shared/services/time.service";
import { SettingsService } from "../settings/services/settings.service";
import { Settings } from "../settings/model/settings";

const START_DATE_STRING = "startdate";
const END_DATE_STRING = "enddate";
const EMPTY_STRING = "";

interface KeyValuePair {
  key: string;
  value: string;
}

@Component({
  selector: "app-timetask",
  templateUrl: "./timetask.component.html",
  styleUrls: ["./timetask.component.scss"],
})
export class TimeTaskComponent implements OnInit {
  todayTimeElements: TimeTask[];
  allTimeElements: TimeTask[];

  runningTimeElement: TimeTask;
  selectedTimeElement: TimeTask;
  historyElements: TimeTask[];
  accumulatedElements: KeyValuePair[];
  historyAccumulatedElements: KeyValuePair[];

  settings: Settings[] = [];

  id: number;
  shortdescr: string;
  longdescr: string;
  startdate: Date;
  enddate: Date;
  testConfig: countUpTimerConfigModel;

  // TODO timerservice doesn't show correct time in google chrome, when tab inactive
  constructor(
    public settingsService: SettingsService,
    private _timeTaskService: TimeTaskService,
    private _timerService: CountupTimerService,
    private _timePickerService: AmazingTimePickerService,
    private _tabTitle: Title,
    private _snackBar: MatSnackBar,
    public _dialog: MatDialog,
    public _utilityService: UtilityService,
    public _keyService: KeyService,
    public _timeService: TimeService
  ) {
    this._tabTitle.setTitle("Time Management");
  }

  ngOnInit() {
    this.getSettingsFromService();
    this.getTimeElementsFromService();
    this.setTimerConfig();
  }

  // Setup view with timer settings
  setTimerConfig() {
    this.testConfig = new countUpTimerConfigModel();
    this.testConfig.timerClass = "test_Timer_class";
    this.testConfig.timerTexts = new timerTexts();
    this.testConfig.timerTexts.hourText = " h -";
    this.testConfig.timerTexts.minuteText = " min -";
    this.testConfig.timerTexts.secondsText = " s";
  }

  /*
   * ===================================================================================
   * HOSTLISTENER
   * ===================================================================================
   */

  @HostListener("click", ["$event"])
  onMouseClick(event: MouseEvent) {
    if (event.shiftKey) {
      this.openInsertDialog();
    }
  }

  @HostListener("window:beforeunload")
  onBeforeUnload() {
    return false;
  }

  /*
   * ===================================================================================
   * TIMEELEMENT METHODS
   * ===================================================================================
   */

  // Get all settings from service
  getSettingsFromService() {
    this.settingsService.getAllSettings().subscribe((settings) => {
      this.settings = settings;
    });
  }

  // Selected current TimeElement if not already set,
  // otherwise hide current selected TimeElement
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

  // Set the current running timeElement
  selectRunningTimeElement(timeElement: TimeTask) {
    this.runningTimeElement = timeElement;
  }

  // Get all TimeTasks from service
  // Fill particular arrays with a subset of all TimeTasks
  getTimeElementsFromService() {
    this.allTimeElements = []; // all TimeTasks from database
    this.todayTimeElements = []; // all TimeTasks from today
    this.historyElements = []; // browse your history for prior TimeTasks

    this._timeTaskService.getAllTimeElements().subscribe((data) => {
      this.allTimeElements = data;
      this.todayTimeElements = this.getTodayTimeTasks(
        //
        this.allTimeElements
      );
      this.accumulatedElements = this.getAccumulatedTimeTaskPairs(
        //
        this.todayTimeElements
      );

      if (this._timerService.isTimerStart) {
        if (this.todayTimeElements.length > 0) {
          this.runningTimeElement = this.todayTimeElements[0];
        }
      }
    });
  }

  // Get all TimeTasks that have today as startdate
  // Return sorted TimeTask array
  getTodayTimeTasks(data: TimeTask[]): TimeTask[] {
    return data
      .filter((e) => {
        let startdate: Date = new Date(e.startdate);
        let now: Date = new Date();

        if (
          startdate.getDate() == now.getDate() &&
          startdate.getMonth() == now.getMonth() &&
          startdate.getFullYear() == now.getFullYear()
        ) {
          return true;
        }
        return false;
      })
      .sort((a, b) => (a.id > b.id ? -1 : 1));
  }

  // Get all TimeTasks with time accumulated by name
  // Return sorted KeyValuePair array
  getAccumulatedTimeTaskPairs(data: TimeTask[]): KeyValuePair[] {
    let array: KeyValuePair[] = [];

    data.forEach((key) => {
      let element: KeyValuePair = {
        key: key.shortdescr, // name of timetask as string
        value: this._timeService.formatMillisecondsToString(
          // time as string
          data
            .filter((e) => e.shortdescr == key.shortdescr)
            .reduce(
              (a, b) =>
                a +
                (new Date(b.enddate).getTime() -
                  new Date(b.startdate).getTime()),
              0
            )
        ),
      };
      if (array.filter((e) => e.key == element.key).length == 0) {
        array.push(element);
      }
    });

    return array;
  }

  // Calculate the overall work time for the current day
  calculateTodayTime(data: TimeTask[]): number {
    return data
      .filter(
        (data) =>
          this._utilityService.objectHasPropertyWithValue(
            data,
            START_DATE_STRING
          ) &&
          this._utilityService.objectHasPropertyWithValue(data, END_DATE_STRING)
      )
      .map(
        (filteredData) =>
          new Date(filteredData.enddate).getTime() -
          new Date(filteredData.startdate).getTime()
      )
      .reduce((a, b) => a + b, 0);
  }

  // Calculate the overall time for the current week
  calculateOverallTime(data: TimeTask[]): number {
    return data
      .filter(
        (data) =>
          this._utilityService.objectHasPropertyWithValue(
            data,
            START_DATE_STRING
          ) &&
          this._utilityService.objectHasPropertyWithValue(
            data,
            END_DATE_STRING
          ) &&
          this._timeService.calculateCurrentWeekNumber() ==
            this._timeService.calculateWeekNumberForDate(
              new Date(data.startdate)
            )
      )
      .map(
        (filteredData) =>
          new Date(filteredData.enddate).getTime() -
          new Date(filteredData.startdate).getTime()
      )
      .reduce((a, b) => a + b, 0);
  }

  // Create a new TimeTask from an already finished TimeTask
  continueTimeElement(timeElement: TimeTask) {
    if (!window.confirm("Are sure you want to continue this item?")) {
      return;
    }

    if (this._timerService.isTimerStart) {
      this.runningTimeElement.enddate = new Date();
      this.enddate.setHours(this.enddate.getHours() + 1);
      this._timeTaskService
        .putTimeElement(this.runningTimeElement)
        .subscribe(() => {
          this.getTimeElementsFromService();
        });
    }
    this.resetTimer();

    let tempTimeElement: TimeTask = {
      id: null,
      title: timeElement.title,
      shortdescr: timeElement.shortdescr,
      longdescr: timeElement.longdescr,
      startdate: this._timeService.createNewDate(),
      enddate: null,
      task: timeElement.task,
    };

    this._timeTaskService.postTimeElement(tempTimeElement).subscribe((data) => {
      this.getTimeElementsFromService();
      this.runningTimeElement = data;
      this.hideSelectedTimeElement();
      this.startTimer();
    });
  }

  // Save TimeTask in the database
  saveTimeElement(timeElement: TimeTask) {
    if (timeElement !== undefined) {
      if (this._utilityService.isNumber(timeElement.id)) {
        this._timeTaskService.putTimeElement(timeElement).subscribe(() => {
          this.openSnackBar("TimeTask saved!", null);
          this.getTimeElementsFromService();
        });
      } else {
        console.warn(
          "saveTimeElement(): ID: " + timeElement.id + ", expected number"
        );
      }
    } else {
      console.warn(
        "saveTimeElement(): ID: " + timeElement.id + ", expected ID"
      );
    }

    this.hideSelectedTimeElement();
  }

  // Save all TimeTasks in the database
  saveAllTimeElements() {
    this.todayTimeElements.forEach((element) => {
      this.saveTimeElement(element);
    });
  }

  // Remove selected TimeTask from the database
  removeTimeElement(timeElement: TimeTask) {
    if (
      timeElement === undefined ||
      !this._utilityService.isNumber(timeElement.id)
    ) {
      return;
    }

    if (!window.confirm("Are sure you want to delete this item?")) {
      return;
    }

    if (
      this.runningTimeElement !== undefined &&
      this.runningTimeElement !== null &&
      timeElement.id == this.runningTimeElement.id
    ) {
      this.openSnackBar("Can't delete current running TimeTask!", null);
      return;
    }

    this._timeTaskService.deleteTimeElement(timeElement.id).subscribe(() => {
      this.openSnackBar("TimeTask removed!", null);
      this.getTimeElementsFromService();
      this.hideSelectedTimeElement();
    });
  }

  deleteAllAvailableTimeTasks() {
    if (!window.confirm("Are sure you want to delete this item?")) {
      return;
    }

    this.historyElements.forEach((e) => {
      this._timeTaskService.deleteTimeElement(e.id).subscribe(() => {
        this.openSnackBar("TimeTask removed!", null);
        this.getTimeElementsFromService();
        this.hideSelectedTimeElement();
      });
    });

    this.historyElements = null;
    this.historyAccumulatedElements = null;
  }

  /*
   * ===================================================================================
   * TIMER
   * ===================================================================================
   */

  // Start timer service and set tab name
  startTimer() {
    this._timerService.startTimer();
    this._tabTitle.setTitle("Timer is running...");
  }

  // Finish the current TimeTask and reset the Timer
  // Add enddate property to TimeElement in the database
  // Triggered with finish button
  finishTimer() {
    if (this._timerService.isTimerStart) {
      this.resetTimer();
      this.runningTimeElement.enddate = this._timeService.createNewDate();
      this._timeTaskService
        .putTimeElement(this.runningTimeElement)
        .subscribe(() => {
          this.hideRunningTimeElement();
          this.hideSelectedTimeElement();
          this.openSnackBar("TimeTask finished!", null);
          this.getTimeElementsFromService();
        });
    }
  }

  // Reset timer back to the start
  resetTimer() {
    this._timerService.stopTimer();
    this._timerService.setTimervalue(0);
    this._tabTitle.setTitle("Time Management");
  }

  /*
   * ===================================================================================
   * DIALOGS/POPUPS
   * ===================================================================================
   */

  // Open popup dialog to create a new TimeTask
  // Finish current TimeTask if still running
  // Add new TimeElement to the database
  openInsertDialog(): void {
    if (this._timerService.isTimerStart) {
      this.runningTimeElement.enddate = this._timeService.createNewDate();
      this._timeTaskService
        .putTimeElement(this.runningTimeElement)
        .subscribe(() => {
          this.openSnackBar("TimeTask saved!", null);
          // this.hideSelectedTimeElement();
          this.getTimeElementsFromService();
        });
    }
    this.resetTimer();
    this.hideSelectedTimeElement();
    this.hideRunningTimeElement();

    const dialogRef = this._dialog.open(InsertTaskDialogTime, {
      width: "250px",
      data: {
        shortdescr: this.shortdescr,
        longdescr: this.longdescr,
      },
    });

    dialogRef.afterClosed().subscribe((resultFromDialog) => {
      if (resultFromDialog !== undefined) {
        resultFromDialog.startdate = this._timeService.createNewDate();
        this.selectRunningTimeElement(resultFromDialog);

        if (this.shortdescr != EMPTY_STRING && this.longdescr != EMPTY_STRING) {
          this._timeTaskService
            .postTimeElement(resultFromDialog)
            .subscribe((resultFromPost) => {
              this.openSnackBar("TimeTask created!", null);
              this.getTimeElementsFromService();
              this.runningTimeElement.id = resultFromPost.id;
              this.resetTimer();
              this.startTimer();
            });
        } else {
          console.warn(
            "dialogRef.afterClosed(): ID: " +
              this.id +
              ", expected that all fields aren't empty"
          );
        }
      } else {
        console.warn(
          "dialogRef.afterClosed(): resultFromDialog: " +
            resultFromDialog +
            ", expected resultFromDialog"
        );
      }
    });
  }

  /*
   * ===================================================================================
   * HELPER FUNCTIONS
   * ===================================================================================
   */

  // Opens popup menu for notifications
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 4000,
    });
  }

  // Change start hour and start minutes of a TimeTask
  changeStartDate(timeElement: TimeTask) {
    const amazingTimePicker = this._timePickerService.open();
    amazingTimePicker.afterClose().subscribe((time) => {
      let temp: Date = new Date();
      let timePickerResult: string[] = time.split(":");

      timeElement.startdate = new Date(
        temp.getFullYear(),
        temp.getMonth(),
        temp.getDate(),
        +timePickerResult[0], // hour
        +timePickerResult[1] // min
      );
    });
  }

  // Change end hour and end minutes of a TimeTask
  changeEndDate(timeElement: TimeTask) {
    const amazingTimePicker = this._timePickerService.open();
    amazingTimePicker.afterClose().subscribe((time) => {
      let temp: Date = new Date();
      let timePickerResult: string[] = time.split(":");

      timeElement.enddate = new Date(
        temp.getFullYear(),
        temp.getMonth(),
        temp.getDate(),
        +timePickerResult[0], // hour
        +timePickerResult[1] // min
      );
    });
  }

  // Create time view string from TimeTask
  timeElementToTimestring(timeElement: TimeTask): string {
    return this._timeService.formatMillisecondsToString(
      new Date(timeElement.enddate).getTime() -
        new Date(timeElement.startdate).getTime()
    );
  }

  // Remove selected TimeElement
  hideSelectedTimeElement() {
    this.selectedTimeElement = null;
  }

  // Remove running TimeElement
  hideRunningTimeElement() {
    this.runningTimeElement = null;
  }

  // Get backround color for different types of TimeTasks
  // Return backround color
  getBackgroundColorValue(timeTask: TimeTask): string {
    if (
      this.runningTimeElement !== undefined &&
      this.runningTimeElement !== null &&
      this.runningTimeElement.id == timeTask.id
    ) {
      return this._keyService.getColor("yellow");
    }

    if (
      this.selectedTimeElement !== undefined &&
      this.selectedTimeElement !== null &&
      this.selectedTimeElement.id == timeTask.id
    ) {
      return this._keyService.getColor("blue");
    }

    if (timeTask !== undefined && timeTask !== null && !timeTask.enddate) {
      return this._keyService.getColor("red");
    }

    return this._keyService.getColor("darkgreen");
  }

  // Get distinct dates of all TimeTasks
  // Returns array of distinct dates
  selectDistinctDates(): Array<string> {
    let tempDates: Date[] = [];
    this.allTimeElements.forEach((timeElement) => {
      if (
        !tempDates.find((date) => {
          let DateToInsert: Date = new Date(timeElement.startdate);
          let insertedDate: Date = new Date(date);
          return (
            insertedDate.getDate() == DateToInsert.getDate() &&
            insertedDate.getMonth() == DateToInsert.getMonth() &&
            insertedDate.getFullYear() == DateToInsert.getFullYear()
          );
        })
      ) {
        tempDates.push(timeElement.startdate);
      }
    });

    return tempDates
      .sort((e) => new Date(e).getTime())
      .map((e) => {
        let date: Date = new Date(e);
        return (
          this._utilityService.formatToTwoDigits(date.getDate()) +
          "." +
          this._utilityService.formatToTwoDigits(date.getMonth() + 1) +
          "." +
          this._utilityService.formatToTwoDigits(date.getFullYear()) +
          ", " +
          this._timeService.getDayString(date.getDay())
        );
      });
  }

  // Get all TimeElements start at the specific date based on the parameter
  // Returns history of TimeElements for a day
  selectDate(event: { value: string }) {
    let str: string[] = event.value.split(",");
    let dateArray: string[] = str[0].split(".");
    let day: string = dateArray[0];
    let month: string = dateArray[1];
    let year: string = dateArray[2];

    this.historyElements = this.allTimeElements.filter((e) => {
      let date: Date = new Date(e.startdate);

      return (
        date.getDate() == +day &&
        date.getMonth() == +month - 1 &&
        date.getFullYear() == +year
      );
    });
    this.historyAccumulatedElements = this.getAccumulatedTimeTaskPairs(
      this.historyElements
    );
  }

  // Change all abbreviations to text in the task description (based on ngModelChange)
  replaceWithShortcut(task: TimeTask) {
    this._keyService.SHORTCUTS.forEach((replacePair) => {
      task.longdescr = task.longdescr.replace(replacePair[0], replacePair[1]);
    });
  }
}