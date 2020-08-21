import { Injectable } from '@angular/core';
import { UtilityService } from './utility.service';

const GER_UTC_PLUS_ONE = 1; // TODO maybe there is a way to determine if summertime
const GER_UTC_PLUS_TWO = 2;

@Injectable({
  providedIn: 'root',
})
export class TimeService {
  constructor(private utilityService: UtilityService) {}

  public createNewDate(): Date {
    const date: Date = new Date();
    date.setHours(date.getUTCHours() + GER_UTC_PLUS_TWO);

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
}
