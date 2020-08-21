import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TimeTask } from '../../../core/timetask/model/timetask';
import { UtilityService } from 'src/app/standard-layout/shared/services/utils/utility.service';
import { TimeService } from 'src/app/standard-layout/shared/services/utils/time.service';
import { NumberValueGraph } from 'src/app/standard-layout/shared/model/GraphData';

@Injectable({
  providedIn: 'root',
})
export class TimeTaskService {
  url = 'http://localhost:3000/timetasks';

  constructor(
    private httpClient: HttpClient,
    private utilityService: UtilityService,
    private timeService: TimeService
  ) {}

  public getTimeTasks(): Observable<TimeTask[]> {
    return this.httpClient.get<Array<TimeTask>>(this.url);
  }

  public getTimeTaskByID(id: number): Observable<TimeTask[]> {
    return this.httpClient.get<Array<TimeTask>>(this.url + '/' + id);
  }

  public postTimeTask(timeTask: TimeTask): Observable<TimeTask> {
    return this.httpClient.post<TimeTask>(this.url, timeTask);
  }

  public putTimeTask(timeTask: TimeTask): Observable<TimeTask> {
    return this.httpClient.put<TimeTask>(
      this.url + '/' + timeTask.id,
      timeTask
    );
  }

  public deleteTimeTask(timeTask: number): Observable<TimeTask> {
    return this.httpClient.delete<TimeTask>(this.url + '/' + timeTask);
  }

  /**
   * @param input timeTask to be checked for todays date
   * @returns time tasks with todays date in numerical order
   */
  public retrieveFromToday(input: TimeTask[]): TimeTask[] {
    return input
      .filter((timeTask) => this.isToday(timeTask))
      .sort((a, b) => this.utilityService.sortNumerical(a.id, b.id));
  }

  /**
   * @param input timeTask to be checked for specific date
   * @returns time tasks with specific date in numerical order
   */
  public retrieveFromHistory(
    timeTask: TimeTask,
    day: string,
    month: string,
    year: string
  ) {
    const date: Date = new Date(timeTask.startDate);

    return (
      date.getDate() === +day &&
      date.getMonth() === +month - 1 &&
      date.getFullYear() === +year
    );
  }

  /**
   * @param input to accumulate time from
   * @returns todays work time in milliseconds
   */
  public calculateTimeForToday(input: TimeTask[]): number {
    return input
      .filter((timeTask) => this.isValid(timeTask))
      .map((validTimeTask) => this.extractTimeBetweenStartAndEnd(validTimeTask))
      .reduce((a, b) => a + b, 0);
  }

  /**
   * @param input to accumulate time from
   * @returns this weeks work time in milliseconds
   */
  public calculateTimeForCurrentWeek(input: TimeTask[]): number {
    return input
      .filter(
        (timeTask) => this.isValid(timeTask) && this.isCurrentWeek(timeTask)
      )
      .map((validTimeTask) => this.extractTimeBetweenStartAndEnd(validTimeTask))
      .reduce((a, b) => a + b, 0);
  }

  /**
   * @param input to be grouped depending on each timeTask
   * @returns key value pair array with task as key and accumulated task time in milliseconds  as value
   */
  public extractAccumulatedTimeTasks(input: TimeTask[]): NumberValueGraph[] {
    return input
      .filter((timeTask) => this.isValid(timeTask))
      .map((validTimeTask) => {
        return {
          name: validTimeTask.shortDescription,
          value: input
            .filter(
              (otherTimeTask) =>
                this.isValid(otherTimeTask) &&
                this.haveSameDescription(validTimeTask, otherTimeTask)
            )
            .reduce((a, b) => a + this.extractTimeBetweenStartAndEnd(b), 0),
        };
      })
      .filter(
        (value, index, self) =>
          self.map((x) => x.name).indexOf(value.name) === index
      );
  }

  /**
   * @param timeTask to extract time from
   * @returns time between start and end in milliseconds
   */
  public extractTimeBetweenStartAndEnd(timeTask: TimeTask): number {
    return (
      new Date(timeTask.endDate).getTime() -
      new Date(timeTask.startDate).getTime()
    );
  }

  public isValid(timeTask: TimeTask): boolean {
    return (
      this.utilityService.objectHasPropertyWithValue(timeTask, 'startDate') &&
      this.utilityService.objectHasPropertyWithValue(timeTask, 'endDate') &&
      timeTask.startDate !== undefined &&
      timeTask.endDate !== undefined &&
      new Date(timeTask.endDate).getTime() >
        new Date(timeTask.startDate).getTime()
    );
  }

  public isToday(timeTask: TimeTask) {
    const startDate: Date = new Date(timeTask.startDate);
    const now: Date = this.timeService.createNewDate();

    return (
      startDate.getDate() === now.getDate() &&
      startDate.getMonth() === now.getMonth() &&
      startDate.getFullYear() === now.getFullYear()
    );
  }

  private isCurrentWeek(timeTask: TimeTask): boolean {
    return (
      this.timeService.calculateCurrentWeekNumber() ===
      this.timeService.calculateWeekNumberForDate(new Date(timeTask.startDate))
    );
  }

  public isSame(timeTask: TimeTask, other: TimeTask) {
    return other !== undefined && other !== null && timeTask.id === other.id;
  }

  private haveSameDescription(timeTask: TimeTask, other: TimeTask): boolean {
    return timeTask.shortDescription === other.shortDescription;
  }
}
