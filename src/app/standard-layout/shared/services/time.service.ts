import { Injectable } from "@angular/core";

const SUMMER_TIME = 1;
// CHANGE to "const WINTER_TIME = 0;" if necessary

@Injectable({
  providedIn: "root",
})
export class TimeService {
  constructor() {}

  // Calculate week number for the current day
  calculateCurrentWeekNumber(): number {
    let now = new Date();
    let onejan = new Date(now.getFullYear(), 0, 1);
    return Math.ceil(
      ((now.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7
    );
  }

  // Calculate week number for the given date
  calculateWeekNumberForDate(date: Date): number {
    let onejan = new Date(date.getFullYear(), 0, 1);
    return Math.ceil(
      ((date.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7
    );
  }

  // Create new Date with correct time
  // Returns current date
  createNewDate(): Date {
    let date: Date = new Date();
    date.setHours(date.getHours() + 1 + SUMMER_TIME);
    return date;
  }

  // Create time view string from milliseconds
  millisecondsToString(milliseconds: number): string {
    let seconds: any = Math.floor((milliseconds / 1000) % 60);
    let minutes: any = Math.floor((milliseconds / (1000 * 60)) % 60);
    let hours: any = Math.floor(milliseconds / (1000 * 60 * 60));
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    return hours + ":" + minutes + ":" + seconds;
  }

  // Checks if an input parameters date is the actual date
  // Returns true, when it's the actual date, otherwise false
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

  // Get specific day of the week
  // Returns week day based on input number
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
}
