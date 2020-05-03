import { Component, OnInit, HostListener } from "@angular/core";
import { TimeTaskService } from "./services/timetask.service";
import { MatDialog, MatSnackBar } from "@angular/material";
import { TimeTask } from "./model/timetask";
import { InsertTaskDialogTime } from "./dialogs/insert-task-dialog";
import { countUpTimerConfigModel, timerTexts } from "ngx-timer";
import { CountupTimerService } from "ngx-timer";
import { Title } from "@angular/platform-browser";
import { StringDistributorService } from "../sharedservices/string-distributor.service";
import { UtilityService } from "../sharedservices/utility.service";
import { AmazingTimePickerService } from "amazing-time-picker";

const START_DATE_STRING = "startdate";
const END_DATE_STRING = "enddate";
const EMPTY_STRING = "";
const SUMER_TIME = 1;
// CHANGE to "const WINTER_TIME = 0;" if necessary

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

  id: number;
  shortdescr: string;
  longdescr: string;
  startdate: Date;
  enddate: Date;
  testConfig: countUpTimerConfigModel;

  // TODO timerservice doesn't show correct time in google chrome, when tab inactive
  constructor(
    private timeTaskService: TimeTaskService,
    private timerService: CountupTimerService,
    public stringDistributorService: StringDistributorService,
    public utilityService: UtilityService,
    private timePickerService: AmazingTimePickerService,
    private _tabTitle: Title,
    public _dialog: MatDialog,
    private _snackBar: MatSnackBar
  ) {
    this._tabTitle.setTitle("Time Management");
  }

  ngOnInit() {
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

  // Get all TimeElements from service
  // Fill three lists with a subset of these TimeElements
  getTimeElementsFromService() {
    this.historyElements = [];
    this.todayTimeElements = [];
    this.allTimeElements = [];

    this.timeTaskService.getAllTimeElements().subscribe((data) => {
      this.allTimeElements = data;

      this.todayTimeElements = data
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

      if (this.timerService.isTimerStart) {
        if (this.todayTimeElements.length > 0) {
          this.runningTimeElement = this.todayTimeElements[0];
        }
      }
    });
  }

  // Calculate the overall work time for the current day
  calculateTodayTime(timeTasks: TimeTask[]): number {
    return timeTasks
      .filter(
        (timetask) =>
          this.utilityService.objectHasPropertyWithValue(
            timetask,
            START_DATE_STRING
          ) &&
          this.utilityService.objectHasPropertyWithValue(
            timetask,
            END_DATE_STRING
          )
      )
      .map(
        (timetask) =>
          new Date(timetask.enddate).getTime() -
          new Date(timetask.startdate).getTime()
      )
      .reduce((a, b) => a + b, 0);
  }

  // Calculate the overall time for the current week
  calculateOverallTime(timeTasks: TimeTask[]): number {
    return timeTasks
      .filter(
        (timeTasks) =>
          this.utilityService.objectHasPropertyWithValue(
            timeTasks,
            START_DATE_STRING
          ) &&
          this.utilityService.objectHasPropertyWithValue(
            timeTasks,
            END_DATE_STRING
          ) &&
          this.calculateWeekNumber() ==
            this.calculateWeekNumberFromDate(new Date(timeTasks.startdate))
      )
      .map(
        (validTimeTasks) =>
          new Date(validTimeTasks.enddate).getTime() -
          new Date(validTimeTasks.startdate).getTime()
      )
      .reduce((a, b) => a + b, 0);
  }

  // Create a new TimeTask from an already finished TimeTask
  continueTimeElement(timeElement: TimeTask) {
    if (!window.confirm("Are sure you want to continue this item?")) {
      return;
    }

    if (this.timerService.isTimerStart) {
      this.runningTimeElement.enddate = new Date();
      this.enddate.setHours(this.enddate.getHours() + 1);
      this.timeTaskService
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
      startdate: this.createDateWithTimeOffset(),
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

  // Save TimeTask in the database
  saveTimeElement(timeElement: TimeTask) {
    if (timeElement !== undefined) {
      if (this.utilityService.isNumber(timeElement.id)) {
        this.timeTaskService.putTimeElement(timeElement).subscribe(() => {
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
    if (timeElement === undefined) {
      return;
    }

    if (!this.utilityService.isNumber(timeElement.id)) {
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

    this.timeTaskService.deleteTimeElement(timeElement.id).subscribe(() => {
      this.openSnackBar("TimeTask removed!", null);
      this.getTimeElementsFromService();
      this.hideSelectedTimeElement();
    });
  }

  /*
   * ===================================================================================
   * TIMER
   * ===================================================================================
   */

  // Start timer service and set tab name
  startTimer() {
    this.timerService.startTimer();
    this._tabTitle.setTitle("Timer is running...");
  }

  // Finish the current TimeTask and reset the Timer
  // Add enddate property to TimeElement in the database
  // Triggered with finish button
  finishTimer() {
    if (this.timerService.isTimerStart) {
      this.resetTimer();
      this.runningTimeElement.enddate = this.createDateWithTimeOffset();
      this.timeTaskService
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
    this.timerService.stopTimer();
    this.timerService.setTimervalue(0);
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
    if (this.timerService.isTimerStart) {
      this.runningTimeElement.enddate = this.createDateWithTimeOffset();
      this.timeTaskService
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
        resultFromDialog.startdate = this.createDateWithTimeOffset();
        this.selectRunningTimeElement(resultFromDialog);

        if (this.shortdescr != EMPTY_STRING && this.longdescr != EMPTY_STRING) {
          this.timeTaskService
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
    const amazingTimePicker = this.timePickerService.open();
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
    const amazingTimePicker = this.timePickerService.open();
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
    return this.millisecondsToTimestring(
      new Date(timeElement.enddate).getTime() -
        new Date(timeElement.startdate).getTime()
    );
  }

  // Create time view string from milliseconds
  millisecondsToTimestring(milliseconds: number): string {
    let seconds: any = Math.floor((milliseconds / 1000) % 60);
    let minutes: any = Math.floor((milliseconds / (1000 * 60)) % 60);
    let hours: any = Math.floor(milliseconds / (1000 * 60 * 60));
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    return hours + ":" + minutes + ":" + seconds;
  }

  // Formate date to string
  // Return formated string
  formatDateToString(date: Date, str: string): string {
    let temp: Date = new Date(date);
    return (
      str +
      ": " +
      this.utilityService.formatToTwoDigits(temp.getHours()) +
      ":" +
      this.utilityService.formatToTwoDigits(temp.getMinutes())
    );
  }

  // Create new Date with correct time
  // Returns current date
  createDateWithTimeOffset(): Date {
    let date: Date = new Date();
    date.setHours(date.getHours() + 1 + SUMER_TIME);
    return date;
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
      return this.stringDistributorService.COLORS.YELLOW;
    }

    if (
      this.selectedTimeElement !== undefined &&
      this.selectedTimeElement !== null &&
      this.selectedTimeElement.id == timeTask.id
    ) {
      return this.stringDistributorService.COLORS.BLUE;
    }

    if (timeTask !== undefined && timeTask !== null && !timeTask.enddate) {
      return this.stringDistributorService.COLORS.RED;
    }

    return this.stringDistributorService.COLORS.DARKGREEN;
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
          this.utilityService.formatToTwoDigits(date.getDate()) +
          "." +
          this.utilityService.formatToTwoDigits(date.getMonth() + 1) +
          "." +
          this.utilityService.formatToTwoDigits(date.getFullYear()) +
          ", " +
          this.utilityService.getDayString(date.getDay())
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
  }

  // Change all abbreviations to text in the task description (based on ngModelChange)
  replaceWithShortcut(task: TimeTask) {
    this.stringDistributorService.SHORTCUTS.forEach((replacePair) => {
      task.longdescr = task.longdescr.replace(replacePair[0], replacePair[1]);
    });
  }

  // Calculate week number for the current day
  calculateWeekNumber(): number {
    let now = new Date();
    let onejan = new Date(now.getFullYear(), 0, 1);
    return Math.ceil(
      ((now.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7
    );
  }

  // Calculate week number for the given date
  calculateWeekNumberFromDate(date: Date): number {
    let onejan = new Date(date.getFullYear(), 0, 1);
    return Math.ceil(
      ((date.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7
    );
  }
}
