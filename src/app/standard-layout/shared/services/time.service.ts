import { Injectable } from "@angular/core";
import { UtilityService } from "./utility.service";

const GER_UTC_PLUS_TWO = 2;

@Injectable({
  providedIn: "root",
})
export class TimeService {
  constructor(private _utilityService: UtilityService) {}

  calculateCurrentWeekNumber(): number {
    let now = new Date();
    let onejan = new Date(now.getFullYear(), 0, 1);

    return Math.ceil(
      ((now.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7
    );
  }

  calculateWeekNumberForDate(date: Date): number {
    let onejan = new Date(date.getFullYear(), 0, 1);

    return Math.ceil(
      ((date.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7
    );
  }

  createNewDate(): Date {
    let date: Date = new Date();
    date.setHours(date.getUTCHours() + GER_UTC_PLUS_TWO);

    return date;
  }

  getDayString(number: number): string {
    return [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ][number];
  }

  isToday(unknownDate: Date): boolean {
    let actualDate = new Date();

    if (
      unknownDate.getDate() == actualDate.getDate() &&
      unknownDate.getMonth() == actualDate.getMonth() &&
      unknownDate.getFullYear() == actualDate.getFullYear()
    ) {
      return true;
    }

    return false;
  }

  isValid(date: Date): boolean {
    return date !== null || date !== undefined ? true : false;
  }

  formatMillisecondsToString(milliseconds: number): string {
    let seconds: any = Math.floor((milliseconds / 1000) % 60);
    let minutes: any = Math.floor((milliseconds / (1000 * 60)) % 60);
    let hours: any = Math.floor(milliseconds / (1000 * 60 * 60));
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds;
  }

  formatDateToStringWithDescription(date: Date, description: string): string {
    let temp: Date = new Date(date);

    return (
      description +
      ": " +
      this._utilityService.formatToTwoDigits(temp.getHours()) +
      ":" +
      this._utilityService.formatToTwoDigits(temp.getMinutes())
    );
  }
}
