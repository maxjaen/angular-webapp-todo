import { Injectable } from "@angular/core";
import { UtilityService } from "./utility.service";

const GER_UTC_PLUS_ONE = 1; // TODO Not needed right now
const GER_UTC_PLUS_TWO = 2;

@Injectable({
  providedIn: "root",
})
export class TimeService {
  constructor(private _utilityService: UtilityService) {}

  /*
   * ===================================================================================
   * CREATE/CALCULATE OPERATIONS
   * ===================================================================================
   */

  /*
   * Create a new date with offset for own timezone
   */
  createNewDate(): Date {
    let date: Date = new Date();
    date.setHours(date.getUTCHours() + GER_UTC_PLUS_TWO);

    return date;
  }

  /*
   * Get day of the week from String array
   */
  createDayString(i: number): string {
    return [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ][i];
  }

  /*
   * ===================================================================================
   * CALCULATIONS
   * ===================================================================================
   */

  /*
   * Calculates week number of the year for todays date
   */
  calculateCurrentWeekNumber(): number {
    const now = this.createNewDate();
    const onejan = new Date(now.getFullYear(), 0, 1);

    return Math.ceil(
      ((now.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7
    );
  }

  /*
   * Calculates week number of the year from given date
   */
  calculateWeekNumberForDate(date: Date): number {
    const onejan = new Date(date.getFullYear(), 0, 1);

    return Math.ceil(
      ((date.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7
    );
  }

  /*
   * Calculates the time difference between input date and current date in milliseconds
   */
  private calculateTimeDifferenceToCurrentDate(date: Date) {
    return new Date(date).getTime() - this.createNewDate().getTime();
  }

  /*
   * ===================================================================================
   * TEST OPERATIONS
   * ===================================================================================
   */

  /*
   * Test if the given date equals today's date
   */
  isToday(date: Date): boolean {
    const unknownDate = new Date(date);
    const currentDate = this.createNewDate();

    return (
      unknownDate.getDate() == currentDate.getDate() &&
      unknownDate.getMonth() == currentDate.getMonth() &&
      unknownDate.getFullYear() == currentDate.getFullYear()
    );
  }

  /*
   * Test if the given date is in the current week
   */
  isThisWeek(unknownDate: Date) {
    // TODO
  }

  /*
   * Test if the given date is in the current month
   */
  isThisMonth(unknownDate: Date) {
    // TODO
  }

  /*
   * Test if the given date is in the current year
   */
  isThisYear(unknownDate: Date) {
    // TODO
  }

  /*
   * Test if the fiven date is valid
   */
  isValid(date: Date): boolean {
    return date !== null || date !== undefined ? true : false;
  }

  /*
   * ===================================================================================
   * STRING FORMATTER OPERATIONS
   * ===================================================================================
   */

  /*
   * Get string  with format 'h:m:s' from given milliseconds
   */
  formatMillisecondsToString(milliseconds: number): string {
    let seconds: any = Math.floor((milliseconds / 1000) % 60);
    let minutes: any = Math.floor((milliseconds / (1000 * 60)) % 60);
    let hours: any = Math.floor(milliseconds / (1000 * 60 * 60));
    hours = hours < 10 ? `0${hours}` : hours;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    seconds = seconds < 10 ? `0${seconds}` : seconds;

    return `${hours}:${minutes}:${seconds}`;
  }

  /*
   * Get string with format 'description: h:m' from given date and description
   */
  formatDateToStringWithDescription(date: Date, description: string): string {
    const temp: Date = new Date(date);

    return `${description}: ${this._utilityService.formatToTwoDigits(
      temp.getHours()
    )}:${this._utilityService.formatToTwoDigits(temp.getMinutes())}`;
  }

  /*
   * Get string with message explaining the current date in proportion to the parameter date
   */
  formatDateToDeadlineMessage(date: Date): string {
    let diffInMilliseconds = this.calculateTimeDifferenceToCurrentDate(date);

    let beforeDeadline: boolean = diffInMilliseconds >= 0;

    if (!beforeDeadline) {
      diffInMilliseconds *= -1;
    }

    if (this.isToday(date)) {
      return "(Your deadline is today!)";
    }

    let days: any = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
    return !beforeDeadline
      ? `(~ ${days} day/s behind your goal)`
      : `(~ ${days} day/s until your deadline)`;
  }
}
