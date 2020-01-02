import { Component, OnInit, HostListener } from '@angular/core';
import { ZeiterfassungService } from './services/zeiterfassung.service';
import { MatDialog } from '@angular/material';
import { TimeElement } from './model/zeiterfassung';
import { InsertTaskDialogTime } from './dialogs/insert-task-dialog';
import { countUpTimerConfigModel, timerTexts } from 'ngx-timer';
import { CountupTimerService } from 'ngx-timer';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-zeiterfassung',
  templateUrl: './zeiterfassung.component.html',
  styleUrls: ['./zeiterfassung.component.scss']
})
export class ZeiterfassungComponent implements OnInit {

  timeElements: TimeElement[];
  selectedTimeElement: TimeElement;
  overallTime: number;

  id: number;
  shortdescr: string;
  longdescr: string;
  startdate: Date;
  enddate: Date;
  testConfig: countUpTimerConfigModel;

  constructor(private zeiterfassungService: ZeiterfassungService, private timerService: CountupTimerService, private titleService:Title, public dialog: MatDialog) {
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
  * SHORTCUTS
  * - creating new task with Shift+Click
  *
  */

  @HostListener('click', ['$event']) onMouseClick(event: MouseEvent) {
    if (event.shiftKey) {
      this.openInsertDialog();
    }
  }

  /*
  *
  * TIMEELEMENT METHODS
  *
  */

  selectTimeElement(timeElement: TimeElement) {
    this.selectedTimeElement = timeElement;
    this.resetTimer();
  }

  getTimeElementsFromService() {
    this.timeElements = [];

    this.zeiterfassungService.getAllTimeElements().subscribe(data => {
      this.timeElements = data
        .filter(e => new Date(e.startdate).getDay() == new Date().getDay())
        .sort((one, two) => (one.id > two.id ? -1 : 1));

      this.overallTime = data
        .filter(e => new Date(e.startdate).getDay() == new Date().getDay())
        .map(e => new Date(e.enddate).getTime() - new Date(e.startdate).getTime())
        .reduce((a, b) => a + b, 0);
    });
  }

  continueTimeElement(timeElement: TimeElement) {
    if (this.timerService.isTimerStart) {
      this.selectedTimeElement.enddate = new Date();
      this.zeiterfassungService.putTimeElement(this.selectedTimeElement).subscribe(e => {
        this.getTimeElementsFromService();
      })
    }
    this.resetTimer();

    let tempTimeElement: TimeElement 
      = { shortdescr: timeElement.shortdescr, longdescr: timeElement.longdescr, id: null, startdate: this.createDateWithTimeOffset(), enddate: null };

    this.zeiterfassungService.postTimeElement(tempTimeElement).subscribe(data => {
      this.getTimeElementsFromService();
      this.selectedTimeElement.id = data.id;
      this.timerService.startTimer();
    });
  }

  saveTimeElement(timeElement: TimeElement) {
    if (!(timeElement === undefined)) {
      if (this.isNumber(timeElement.id)) {
        this.zeiterfassungService.putTimeElement(timeElement).subscribe(data => {
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

  removeTimeElement(timeElement: TimeElement) {
    if (!(timeElement.id == this.selectedTimeElement.id)) {
      if (!(timeElement === undefined)) {
        if (this.isNumber(timeElement.id)) {
          this.zeiterfassungService.deleteTimeElement(timeElement.id).subscribe(data => {
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
      console.warn("Can't remove selected item: " + timeElement)
    }
  }

  /*
  *
  * TIMER
  *
  */

  pauseTimer() {
    if (this.timerService.isTimerStart) {
      this.resetTimer();
      this.selectedTimeElement.enddate = this.createDateWithTimeOffset();
      this.zeiterfassungService.putTimeElement(this.selectedTimeElement).subscribe(e => {
        this.getTimeElementsFromService();
      })
    }
    this.hideSelectedTimeElement();
  }

  resetTimer() {
    this.timerService.stopTimer();
    this.timerService.setTimervalue(0);
  }

  /*
  *
  * DIALOGS/POPUPS
  *
  */

  openInsertDialog(): void {
    if (this.timerService.isTimerStart) {
      this.selectedTimeElement.enddate = this.createDateWithTimeOffset();
      this.zeiterfassungService.putTimeElement(this.selectedTimeElement).subscribe(e => {
        this.hideSelectedTimeElement();
        this.getTimeElementsFromService();
      })
    }
    this.resetTimer();

    const dialogRef = this.dialog.open(InsertTaskDialogTime, {
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
          this.zeiterfassungService.postTimeElement(resultFromDialog).subscribe(resultFromPost => {
            this.getTimeElementsFromService();
            this.selectedTimeElement.id = resultFromPost.id;
            this.timerService.startTimer();
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

  isNumber(param: any): boolean {
    return !(isNaN(Number(param)))
  }

  timeElementToTimestring(timeElement: TimeElement): string {
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

  showClockstring(timeElement: TimeElement): string {
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