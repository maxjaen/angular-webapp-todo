import { Component, OnInit, HostListener } from '@angular/core';
import { TimeTaskService } from './services/timetask.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { TimeTask } from './model/timetask';
import { InsertTaskDialogTime } from './dialogs/insert-task-dialog';
import { countUpTimerConfigModel, timerTexts } from 'ngx-timer';
import { CountupTimerService } from 'ngx-timer';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-timetask',
  templateUrl: './timetask.component.html',
  styleUrls: ['./timetask.component.scss']
})
export class TimeTaskComponent implements OnInit {

  timeElements: TimeTask[];
  selectedTimeElement: TimeTask;
  overallTime: number;

  id: number;
  shortdescr: string;
  longdescr: string;
  startdate: Date;
  enddate: Date;
  testConfig: countUpTimerConfigModel;

  // TODO timerservice doesn't show correct time in chrome, when tab inactive
  constructor(private timeTaskService: TimeTaskService, private timerService: CountupTimerService, private titleService:Title, public _dialog: MatDialog, private _snackBar: MatSnackBar) {
    this.titleService.setTitle("Zeiterfassung");
  }

  ngOnInit() {
    this.getTimeElementsFromService();
    this.setTimerConfig();
  }

  setTimerConfig() {
    this.testConfig = new countUpTimerConfigModel();
    this.testConfig.timerClass = 'test_Timer_class';
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

  @HostListener('click', ['$event'])
  onMouseClick(event: MouseEvent) {
    if (event.shiftKey) {
      this.openInsertDialog();
    }
  }

  @HostListener('window:beforeunload')
  onBeforeUnload() {
      return false;
  }

  /*
  *
  * TIMEELEMENT METHODS
  *
  */

  selectTimeElement(timeElement: TimeTask) {
    this.selectedTimeElement = timeElement;
    this.resetTimer();
  }

  getTimeElementsFromService() {
    this.timeElements = [];

    this.timeTaskService.getAllTimeElements().subscribe(data => {
      this.timeElements = data
        .filter(e => new Date(e.startdate).getDay() == new Date().getDay())
        .sort((a, b) => (a.id > b.id ? -1 : 1));      

      this.overallTime = data
        .filter(e => new Date(e.startdate).getDay() == new Date().getDay())
        .filter(e => e.enddate !== null)
        .map(e => new Date(e.enddate).getTime() - new Date(e.startdate).getTime())
        .reduce((a, b) => a + b, 0);
    });
  }

  continueTimeElement(timeElement: TimeTask) {
    if (this.timerService.isTimerStart) {
      this.selectedTimeElement.enddate = new Date();
      this.timeTaskService.putTimeElement(this.selectedTimeElement).subscribe(() => {
        this.getTimeElementsFromService();
      })
    }
    this.resetTimer();

    let tempTimeElement: TimeTask = { shortdescr: timeElement.shortdescr, longdescr: timeElement.longdescr, id: null, startdate: this.createDateWithTimeOffset(), enddate: null };

    this.timeTaskService.postTimeElement(tempTimeElement).subscribe(data => {
      this.getTimeElementsFromService();
      this.selectedTimeElement = data;
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
        console.warn("saveTimeElement(): ID: " + timeElement.id + ", expected number")
      }
    } else {
      console.warn("saveTimeElement(): ID: " + timeElement.id + ", expected ID")
    }

    this.hideSelectedTimeElement();
  }

  saveAllTimeElements() {
    this.timeElements.forEach(element => {
      this.saveTimeElement(element);
    });
  }

  removeTimeElement(timeElement: TimeTask) {
    if ((!(timeElement.id == this.selectedTimeElement.id) || (this.timeElements.length == 1))) {
      if (!(timeElement === undefined)) {
        if (this.isNumber(timeElement.id)) {
          this.timeTaskService.deleteTimeElement(timeElement.id).subscribe(() => {
            this.openSnackBar("TimeTask removed!", null);
            this.getTimeElementsFromService();
            this.hideSelectedTimeElement();
          });
        } else {
          console.warn("removeTimeElement(): ID: " + timeElement.id + ", expected number")
        }
      } else {
        console.warn("removeTimeElement(): ID: " + timeElement.id + ", expected ID")
      }
    } else {
      console.warn("Can't remove selected item: " + timeElement + this.timeElements.length)
    }
  }

  /*
  *
  * TIMER
  *
  */

  startTimer(){
    this.timerService.startTimer();
    this.titleService.setTitle("Zeiterfassung - Timer läuft...");
  }

  pauseTimer() {
    if (this.timerService.isTimerStart) {
      this.resetTimer();
      this.selectedTimeElement.enddate = this.createDateWithTimeOffset();
      this.timeTaskService.putTimeElement(this.selectedTimeElement).subscribe(() => {
        this.openSnackBar("TimeTask finished!", null);
        this.getTimeElementsFromService();
      })
    }
    this.hideSelectedTimeElement();
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
      this.selectedTimeElement.enddate = this.createDateWithTimeOffset();
      this.timeTaskService.putTimeElement(this.selectedTimeElement).subscribe(() => {
        this.openSnackBar("TimeTask saved!", null);
        this.hideSelectedTimeElement();
        this.getTimeElementsFromService();
      })
    }
    this.resetTimer();

    const dialogRef = this._dialog.open(InsertTaskDialogTime, {
      width: '250px',
      data: {
        shortdescr: this.shortdescr,
        longdescr: this.longdescr
      }
    });

    dialogRef.afterClosed().subscribe(resultFromDialog => {
      if (!(resultFromDialog === undefined)) {
        resultFromDialog.startdate = this.createDateWithTimeOffset();
        this.selectTimeElement(resultFromDialog);

        if (this.shortdescr != "" && this.longdescr != "") {
          this.timeTaskService.postTimeElement(resultFromDialog).subscribe(resultFromPost => {
            this.openSnackBar("TimeTask created!", null);
            this.getTimeElementsFromService();
            this.selectedTimeElement.id = resultFromPost.id;
            this.startTimer();
          });
        } else {
          console.warn("dialogRef.afterClosed(): ID: " + this.id + ", expected that all fields aren't empty")
        }
      } else {
        console.warn("dialogRef.afterClosed(): resultFromDialog: " + resultFromDialog + ", expected resultFromDialog")
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
      duration: 2000,
    });
  }

  isNumber(param: any): boolean {
    return !(isNaN(Number(param)))
  }

  timeElementToTimestring(timeElement: TimeTask): string {
    return this.elementToTimestring(new Date(timeElement.enddate).getTime() - new Date(timeElement.startdate).getTime());
  }

  millisecondsToTimestring(milliseconds: number): string {
    return this.elementToTimestring(milliseconds);
  }

  elementToTimestring(milliseconds: number): string {
    let seconds: any = Math.floor((milliseconds / 1000) % 60);
    let minutes: any = Math.floor((milliseconds / (1000 * 60)) % 60);
    let hours: any = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    return hours + ":" + minutes + ":" + seconds;
  }

  showClockstring(timeElement: TimeTask): string {
    let startDate: Date = new Date(timeElement.startdate);
    let endDate: Date = new Date(timeElement.enddate);
    return "Started: " + this.fixClockstring(startDate.getHours())
      + ":" + this.fixClockstring(startDate.getMinutes()) + ", "
      + "Finished: " + this.fixClockstring(endDate.getHours())
      + ":" + this.fixClockstring(endDate.getMinutes());
  }

  fixClockstring(time: number) {
    return (time < 10) ? "0" + time : time;
  }

  createDateWithTimeOffset(): Date {
    let date: Date = new Date();
    date.setHours(date.getHours() + 1);
    return date;
  }

  hideSelectedTimeElement() {
    this.selectedTimeElement = null;
  }
}