import { Component, OnInit, HostListener } from "@angular/core";
import { TimeTaskService } from "./services/timetask.service";
import { MatDialog, MatSnackBar } from "@angular/material";
import { TimeTask } from "./model/timetask";
import { InsertTaskDialogTime } from "./dialogs/insert-task-dialog";
import { countUpTimerConfigModel, timerTexts } from "ngx-timer";
import { CountupTimerService } from "ngx-timer";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-timetask",
  templateUrl: "./timetask.component.html",
  styleUrls: ["./timetask.component.scss"]
})
export class TimeTaskComponent implements OnInit {
  timeElements: TimeTask[];
  _timeElements: TimeTask[];

  runningTimeElement: TimeTask;
  selectedTimeElement: TimeTask;
  selectedHistoryElements: TimeTask[];

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
    this.selectedHistoryElements = [];
    this.timeElements = [];
    this._timeElements = [];

    this.timeTaskService.getAllTimeElements().subscribe(data => {
      this._timeElements = data;

      this.timeElements = data
        .filter(e => new Date(e.startdate).getDate() == new Date().getDate())
        .sort((a, b) => (a.id > b.id ? -1 : 1));

      if (this.timerService.isTimerStart) {
        if (this.timeElements.length > 0) {
          this.runningTimeElement = this.timeElements[0];
        }
      }
    });
  }

  calculateOverallTime(timeTasks: TimeTask[]): number {
    return timeTasks
      .filter(
        e =>
          e.hasOwnProperty("startdate") &&
          e.startdate !== null &&
          e.startdate !== undefined
      )
      .filter(
        e =>
          e.hasOwnProperty("enddate") &&
          e.enddate !== null &&
          e.enddate !== undefined
      )
      .map(e => new Date(e.enddate).getTime() - new Date(e.startdate).getTime())
      .reduce((a, b) => a + b, 0);
  }

  continueTimeElement(timeElement: TimeTask) {
    if (!window.confirm("Are sure you want to continue this item ?")) {
      return;
    }

    if (this.timerService.isTimerStart) {
      this.runningTimeElement.enddate = new Date();
      this.timeTaskService
        .putTimeElement(this.runningTimeElement)
        .subscribe(() => {
          this.getTimeElementsFromService();
        });
    }
    this.resetTimer();

    let tempTimeElement: TimeTask = {
      shortdescr: timeElement.shortdescr,
      longdescr: timeElement.longdescr,
      id: null,
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
      if (this.isNumber(timeElement.id)) {
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
    this.timeElements.forEach(element => {
      this.saveTimeElement(element);
    });
  }

  removeTimeElement(timeElement: TimeTask) {
    if (timeElement === undefined) {
      return;
    }

    if (!this.isNumber(timeElement.id)) {
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

  isNumber(param: any): boolean {
    return !isNaN(Number(param));
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
    let hours: any = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    return hours + ":" + minutes + ":" + seconds;
  }

  showClockstring(timeElement: TimeTask): string {
    let startDate: Date = new Date(timeElement.startdate);
    let endDate: Date = new Date(timeElement.enddate);
    return (
      "Started: " +
      this.fixClockstring(startDate.getHours()) +
      ":" +
      this.fixClockstring(startDate.getMinutes()) +
      ", " +
      "Finished: " +
      this.fixClockstring(endDate.getHours()) +
      ":" +
      this.fixClockstring(endDate.getMinutes())
    );
  }

  fixClockstring(time: number) {
    return time < 10 ? "0" + time : time;
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
      return "#6c4747"; // Dunkelrot
    }

    if (
      this.selectedTimeElement !== undefined &&
      this.selectedTimeElement !== null &&
      this.selectedTimeElement.id == timeTask.id
    ) {
      return "#47556c";
    }

    return "#424242";
  }

  selectDistinctDates(): Array<String> {
    let tempDates: Date[] = [];
    this._timeElements.forEach(timeElement => {
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

    return tempDates.map(e => {
      let date: Date = new Date(e);
      return (
        date.getDate() + "." + date.getMonth() + 1 + "." + date.getFullYear()
      );
    });
  }

  selectDate(event: { value: String }) {
    let dateArray: String[] = event.value.split(".");
    let day: String = dateArray[0];
    let month: String = dateArray[1];
    let year: String = dateArray[2];

    this.selectedHistoryElements = this._timeElements.filter(e => {
      let date: Date = new Date(e.startdate);

      return (
        date.getDate() == +day &&
        date.getMonth() == +month - 1 &&
        date.getFullYear() == +year
      );
    });
  }

  getBulletPoints(str: string) {
    let stringArray = str.split("\n");
    return stringArray;
  }
}
