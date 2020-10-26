import { Injectable } from '@angular/core';
import { UtilityService } from './utility.service';

const GER_UTC_PLUS_ONE = 1;
const GER_UTC_PLUS_TWO = 2;

@Injectable({
  providedIn: 'root',
})
export class TimeService {
  constructor(private utilityService: UtilityService) {}

  public createNewDate(): Date {
    const date: Date = new Date();
    date.setHours(this.isDST(date) ? date.getUTCHours() + GER_UTC_PLUS_TWO: date.getUTCHours() + GER_UTC_PLUS_ONE);

    return date;
  }

  public retrieveDayOfTheWeek(index: number): string {
    return [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ][index];
  }

  public calculateCurrentWeekNumber(): number {
    const now = this.createNewDate();
    const firstOfJanuary = new Date(now.getFullYear(), 0, 1);

    return Math.ceil(
      ((now.getTime() - firstOfJanuary.getTime()) / 86400000 +
        firstOfJanuary.getDay() +
        1) /
        7
    );
  }

  public calculateWeekNumberForDate(date: Date): number {
    const firstOfJanuary = new Date(date.getFullYear(), 0, 1);

    return Math.ceil(
      ((date.getTime() - firstOfJanuary.getTime()) / 86400000 +
        firstOfJanuary.getDay() +
        1) /
        7
    );
  }

  public calculateTimeDifferenceToCurrentDate(date: Date) {
    return new Date(date).getTime() - this.createNewDate().getTime();
  }

  public formatMillisecondsToString(milliseconds: number): string {
    let seconds: any = Math.floor((milliseconds / 1000) % 60);
    let minutes: any = Math.floor((milliseconds / (1000 * 60)) % 60);
    let hours: any = Math.floor(milliseconds / (1000 * 60 * 60));
    hours = hours < 10 ? `0${hours}` : hours;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    seconds = seconds < 10 ? `0${seconds}` : seconds;

    return `${hours}:${minutes}:${seconds}`;
  }

  public formatDateToStringWithDescription(
    date: Date,
    description: string
  ): string {
    const temp: Date = new Date(date);

    return `${description}: ${this.utilityService.formatToTwoDigits(
      temp.getHours()
    )}:${this.utilityService.formatToTwoDigits(temp.getMinutes())}`;
  }

  public isValid(date: Date): boolean {
    return date !== null || date !== undefined;
  }

  public isToday(date: Date): boolean {
    const unknownDate = new Date(date);
    const currentDate = this.createNewDate();

    return (
      unknownDate.getDate() === currentDate.getDate() &&
      unknownDate.getMonth() === currentDate.getMonth() &&
      unknownDate.getFullYear() === currentDate.getFullYear()
    );
  }

  /**
   * Checks if a date is in the Daylight Saving Time (DST) in germany.
   * DST starts on Sunday 29 March 2020, 02:00
   * DST ends on Sunday 25 October 2020, 03:00 
   * https://24timezones.com/Germany/time
   * https://stackoverflow.com/questions/11887934/how-to-check-if-dst-daylight-saving-time-is-in-effect-and-if-so-the-offset
   * 
   * @param date to be checked if in dst or not
   */
  private isDST(date: Date) {
    let jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
    let jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
    return Math.max(jan, jul) != date.getTimezoneOffset(); 
  }
}
