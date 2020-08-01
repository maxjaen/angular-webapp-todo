import { Injectable } from '@angular/core';
import { UtilityService } from './utility.service';

const GER_UTC_PLUS_ONE = 1; // TODO Not needed right now
const GER_UTC_PLUS_TWO = 2;

@Injectable({
  providedIn: 'root',
})
export class TimeService {
  constructor(private utilityService: UtilityService) {}

  /*
   * ===================================================================================
   * CREATE/CALCULATE OPERATIONS
   * ===================================================================================
   */

  /*
   * Create a new date with offset for own timezone
   */
  public createNewDate(): Date {
    const date: Date = new Date();
    date.setHours(date.getUTCHours() + GER_UTC_PLUS_TWO);

    return date;
  }

  /*
   * Get day of the week from String array
   */
  public createDayString(i: number): string {
    return [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
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
  public calculateCurrentWeekNumber(): number {
    const now = this.createNewDate();
    const onejan = new Date(now.getFullYear(), 0, 1);

    return Math.ceil(
      ((now.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7
    );
  }

  /*
   * Calculates week number of the year from given date
   */
  public calculateWeekNumberForDate(date: Date): number {
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
  public isToday(date: Date): boolean {
    const unknownDate = new Date(date);
    const currentDate = this.createNewDate();

    return (
      unknownDate.getDate() === currentDate.getDate() &&
      unknownDate.getMonth() === currentDate.getMonth() &&
      unknownDate.getFullYear() === currentDate.getFullYear()
    );
  }

  /*
   * Test if the given date is in the current week
   */
  public isThisWeek(unknownDate: Date) {
    // TODO
  }

  /*
   * Test if the given date is in the current month
   */
  public isThisMonth(unknownDate: Date) {
    // TODO
  }

  /*
   * Test if the given date is in the current year
   */
  public isThisYear(unknownDate: Date) {
    // TODO
  }

  /*
   * Test if the fiven date is valid
   */
  public isValid(date: Date): boolean {
    return date !== null || date !== undefined;
  }

  /*
   * ===================================================================================
   * STRING FORMATTER OPERATIONS
   * ===================================================================================
   */

  /*
   * Get string  with format 'h:m:s' from given milliseconds
   */
  public formatMillisecondsToString(milliseconds: number): string {
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
  public formatDateToStringWithDescription(
    date: Date,
    description: string
  ): string {
    const temp: Date = new Date(date);

    return `${description}: ${this.utilityService.formatToTwoDigits(
      temp.getHours()
    )}:${this.utilityService.formatToTwoDigits(temp.getMinutes())}`;
  }

  /*
   * Get string with message explaining the current date in proportion to the parameter date
   */
  public formatDateToDeadlineMessage(date: Date): string {
    let diffInMilliseconds = this.calculateTimeDifferenceToCurrentDate(date);

    const beforeDeadline: boolean = diffInMilliseconds >= 0;

    if (!beforeDeadline) {
      diffInMilliseconds *= -1;
    }

    if (this.isToday(date)) {
      return '(Your deadline is today!)';
    }

    const days: any = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
    return !beforeDeadline
      ? `(~ ${days} day/s behind your goal)`
      : `(~ ${days} day/s until your deadline)`;
  }
}
