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

@Component({
  selector: "app-timetask",
  templateUrl: "./timetask.component.html",
  styleUrls: ["./timetask.component.scss"]
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
    private titleService: Title,
    public _dialog: MatDialog,
    private _snackBar: MatSnackBar
  ) {
    this.titleService.setTitle("Zeiterfassung");
  }

  ngOnInit() {
    this.getTimeElementsFromService();
    this.setTimerConfig();
  }

  setTimerConfig() {
    this.testConfig = new countUpTimerConfigModel();
    this.testConfig.timerClass = "test_Timer_class";
    this.testConfig.timerTexts = new timerTexts();
    this.testConfig.timerTexts.hourText = " h -";
    this.testConfig.timerTexts.minuteText = " min -";
    this.testConfig.timerTexts.secondsText = " s";
  }

  /*
   *
   * HOSTLISTENER
   *
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
   *
   * TIMEELEMENT METHODS
   *
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

  selectRunningTimeElement(timeElement: TimeTask) {
    this.runningTimeElement = timeElement;
  }

  getTimeElementsFromService() {
    this.historyElements = [];
    this.todayTimeElements = [];
    this.allTimeElements = [];

    this.timeTaskService.getAllTimeElements().subscribe(data => {
      this.allTimeElements = data;

      this.todayTimeElements = data
        .filter(e => {
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

  calculateTodayTime(timeTasks: TimeTask[]): number {
    return timeTasks
      .filter(
        e =>
          this.utilityService.propertyHasValue(e, "startdate") &&
          this.utilityService.propertyHasValue(e, "enddate")
      )
      .map(e => new Date(e.enddate).getTime() - new Date(e.startdate).getTime())
      .reduce((a, b) => a + b, 0);
  }

  calculateOverallTime(timeTasks: TimeTask[]): number {
    return timeTasks
      .filter(
        e =>
          this.utilityService.propertyHasValue(e, "startdate") &&
          this.utilityService.propertyHasValue(e, "enddate") &&
          this.calculateWeekNumber() ==
            this.calculateWeekNumberFromDate(new Date(e.startdate))
      )
      .map(e => new Date(e.enddate).getTime() - new Date(e.startdate).getTime())
      .reduce((a, b) => a + b, 0);
  }

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
      task: timeElement.task
    };

    this.timeTaskService.postTimeElement(tempTimeElement).subscribe(data => {
      this.getTimeElementsFromService();
      this.runningTimeElement = data;
      this.hideSelectedTimeElement();
      this.startTimer();
    });
  }

  saveTimeElement(timeElement: TimeTask) {
    if (!(timeElement === undefined)) {
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

  saveAllTimeElements() {
    this.todayTimeElements.forEach(element => {
      this.saveTimeElement(element);
    });
  }

  removeTimeElement(timeElement: TimeTask) {
    if (timeElement === undefined) {
      return;
    }

    if (!this.utilityService.isNumber(timeElement.id)) {
      return;
    }

    if (!window.confirm("Are sure you want to delete this item ?")) {
      return;
    }

    if (
      this.runningTimeElement !== undefined &&
      this.runningTimeElement !== null &&
      timeElement.id == this.runningTimeElement.id
    ) {
      this.openSnackBar("Can't delete running TimeTask!", null);
      return;
    }

    this.timeTaskService.deleteTimeElement(timeElement.id).subscribe(() => {
      this.openSnackBar("TimeTask removed!", null);
      this.getTimeElementsFromService();
      this.hideSelectedTimeElement();
    });
  }

  /*
   *
   * TIMER
   *
   */

  startTimer() {
    this.timerService.startTimer();
    this.titleService.setTitle("Zeiterfassung - Timer läuft...");
  }

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

  resetTimer() {
    this.timerService.stopTimer();
    this.timerService.setTimervalue(0);
    this.titleService.setTitle("Zeiterfassung");
  }

  /*
   *
   * DIALOGS/POPUPS
   *
   */

  openInsertDialog(): void {
    if (this.timerService.isTimerStart) {
      this.runningTimeElement.enddate = this.createDateWithTimeOffset();
      this.timeTaskService
        .putTimeElement(this.runningTimeElement)
        .subscribe(() => {
          this.openSnackBar("TimeTask saved!", null);
          this.hideSelectedTimeElement();
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
        longdescr: this.longdescr
      }
    });

    dialogRef.afterClosed().subscribe(resultFromDialog => {
      if (!(resultFromDialog === undefined)) {
        resultFromDialog.startdate = this.createDateWithTimeOffset();
        this.selectRunningTimeElement(resultFromDialog);

        if (this.shortdescr != "" && this.longdescr != "") {
          this.timeTaskService
            .postTimeElement(resultFromDialog)
            .subscribe(resultFromPost => {
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
   *
   * HELPER FUNCTIONS
   *
   */

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 4000
    });
  }

  changeStartDate(timeElement: TimeTask) {
    const amazingTimePicker = this.timePickerService.open();
    amazingTimePicker.afterClose().subscribe(time => {
      let temp: Date = new Date();
      let test: string[] = time.split(":");

      timeElement.startdate = new Date(
        temp.getFullYear(),
        temp.getMonth(),
        temp.getDate(),
        +test[0],
        +test[1]
      );
    });
  }

  changeEndDate(timeElement: TimeTask) {
    const amazingTimePicker = this.timePickerService.open();
    amazingTimePicker.afterClose().subscribe(time => {
      let temp: Date = new Date();
      let test: string[] = time.split(":");

      timeElement.enddate = new Date(
        temp.getFullYear(),
        temp.getMonth(),
        temp.getDate(),
        +test[0],
        +test[1]
      );
    });
  }

  timeElementToTimestring(timeElement: TimeTask): string {
    return this.elementToTimestring(
      new Date(timeElement.enddate).getTime() -
        new Date(timeElement.startdate).getTime()
    );
  }

  millisecondsToTimestring(milliseconds: number): string {
    return this.elementToTimestring(milliseconds);
  }

  elementToTimestring(milliseconds: number): string {
    let seconds: any = Math.floor((milliseconds / 1000) % 60);
    let minutes: any = Math.floor((milliseconds / (1000 * 60)) % 60);
    let hours: any = Math.floor(milliseconds / (1000 * 60 * 60));
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    return hours + ":" + minutes + ":" + seconds;
  }

  formatDateToString(date: Date, str: String): string {
    let temp: Date = new Date(date);
    return (
      str +
      ": " +
      this.utilityService.formatToTwoDigits(temp.getHours()) +
      ":" +
      this.utilityService.formatToTwoDigits(temp.getMinutes())
    );
  }

  createDateWithTimeOffset(): Date {
    let date: Date = new Date();
    date.setHours(date.getHours() + 1);
    return date;
  }

  hideSelectedTimeElement() {
    this.selectedTimeElement = null;
  }

  hideRunningTimeElement() {
    this.runningTimeElement = null;
  }

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

  selectDistinctDates(): Array<String> {
    let tempDates: Date[] = [];
    this.allTimeElements.forEach(timeElement => {
      if (
        !tempDates.find(date => {
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
      .sort(e => new Date(e).getTime())
      .map(e => {
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

  selectDate(event: { value: String }) {
    let str: String[] = event.value.split(",");
    let dateArray: String[] = str[0].split(".");
    let day: String = dateArray[0];
    let month: String = dateArray[1];
    let year: String = dateArray[2];

    this.historyElements = this.allTimeElements.filter(e => {
      let date: Date = new Date(e.startdate);

      return (
        date.getDate() == +day &&
        date.getMonth() == +month - 1 &&
        date.getFullYear() == +year
      );
    });
  }

  replaceWithShortcut(task: TimeTask) {
    this.stringDistributorService.SHORTCUTS.forEach(replacePair => {
      task.longdescr = task.longdescr.replace(replacePair[0], replacePair[1]);
    });
  }

  calculateWeekNumber(): number {
    let now = new Date();
    let onejan = new Date(now.getFullYear(), 0, 1);
    return Math.ceil(
      ((now.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7
    );
  }

  calculateWeekNumberFromDate(date: Date): number {
    let onejan = new Date(date.getFullYear(), 0, 1);
    return Math.ceil(
      ((date.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7
    );
  }
}
