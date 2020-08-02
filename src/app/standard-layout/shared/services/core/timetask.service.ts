import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TimeTask } from '../../../core/timetask/model/timetask';
import { UtilityService } from 'src/app/standard-layout/shared/services/utils/utility.service';
import { TimeService } from 'src/app/standard-layout/shared/services/utils/time.service';
import { NameAndNumberPair } from 'src/app/standard-layout/shared/model/GraphData';

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

  public getTimeElements(): Observable<TimeTask[]> {
    return this.httpClient.get<Array<TimeTask>>(this.url);
  }

  public getTimeElementByID(id: number): Observable<TimeTask[]> {
    return this.httpClient.get<Array<TimeTask>>(this.url + '/' + id);
  }

  public postTimeElement(timeTask: TimeTask): Observable<TimeTask> {
    return this.httpClient.post<TimeTask>(this.url, timeTask);
  }

  public putTimeElement(timeTask: TimeTask): Observable<TimeTask> {
    return this.httpClient.put<TimeTask>(
      this.url + '/' + timeTask.id,
      timeTask
    );
  }

  public deleteTimeElement(timeTask: number): Observable<TimeTask> {
    return this.httpClient.delete<TimeTask>(this.url + '/' + timeTask);
  }

  /**
   * @param input timetask to be checked for todays date
   * @returns time tasks with todays date in numerical order
   */
  public retrieveTimeTasksFromToday(input: TimeTask[]): TimeTask[] {
    return input
      .filter((e) => {
        const startdate: Date = new Date(e.startdate);
        const now: Date = this.timeService.createNewDate();

        return (
          startdate.getDate() === now.getDate() &&
          startdate.getMonth() === now.getMonth() &&
          startdate.getFullYear() === now.getFullYear()
        );
      })
      .sort((a, b) => this.utilityService.sortNumerical(a.id, b.id));
  }

  /**
   * @param input to accumulate time from
   * @returns todays work time in milliseconds
   */
  public calculateTimeForToday(input: TimeTask[]): number {
    return input
      .filter((timeTask) => this.isValid(timeTask))
      .map((validTimeTask) => this.extractTimeBetweenStartandEnd(validTimeTask))
      .reduce((a, b) => a + b, 0);
  }

  /**
   * @param input to accumulate time from
   * @returns this weeks work time in milliseconds
   */
  public calculateTimeForCurrentWeek(input: TimeTask[]): number {
    return input
      .filter((timeTask) => this.isValid(timeTask))
      .filter(
        (validTimeTask) =>
          this.timeService.calculateCurrentWeekNumber() ===
          this.timeService.calculateWeekNumberForDate(
            new Date(validTimeTask.startdate)
          )
      )
      .map((validTimeTask) => this.extractTimeBetweenStartandEnd(validTimeTask))
      .reduce((a, b) => a + b, 0);
  }

  /**
   * @param input to be grouped depending on each timetask
   * @returns key value pair array with task as key and accumulated task time in milliseconds  as value
   */
  public extractAccumulatedTimeTasks(input: TimeTask[]): NameAndNumberPair[] {
    return input
      .filter((timeTask) => this.isValid(timeTask))
      .map((validTimeTask) => {
        return {
          name: validTimeTask.shortdescr,
          value: input
            .filter((othertimeTask) => this.isValid(othertimeTask))
            .filter(
              (otherValidTimeTask) =>
                validTimeTask.shortdescr === otherValidTimeTask.shortdescr
            )
            .reduce((a, b) => a + this.extractTimeBetweenStartandEnd(b), 0),
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
  private extractTimeBetweenStartandEnd(timeTask: TimeTask): number {
    return (
      new Date(timeTask.enddate).getTime() -
      new Date(timeTask.startdate).getTime()
    );
  }

  public isValid(timetask: TimeTask): boolean {
    return (
      this.utilityService.objectHasPropertyWithValue(timetask, 'startdate') &&
      this.utilityService.objectHasPropertyWithValue(timetask, 'enddate') &&
      timetask.startdate !== undefined &&
      timetask.enddate !== undefined &&
      new Date(timetask.enddate).getTime() >
        new Date(timetask.startdate).getTime()
    );
  }
}