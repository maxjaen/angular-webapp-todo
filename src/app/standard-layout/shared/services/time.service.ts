import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class TimeService {
  constructor() {}

  // Calculate week number for the current day
  calculateWeekNumber(): number {
    let now = new Date();
    let onejan = new Date(now.getFullYear(), 0, 1);
    return Math.ceil(
      ((now.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7
    );
  }

  // Calculate week number for the given date
  calculateWeekNumberFromDate(date: Date): number {
    let onejan = new Date(date.getFullYear(), 0, 1);
    return Math.ceil(
      ((date.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7
    );
  }
}
