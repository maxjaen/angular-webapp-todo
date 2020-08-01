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

  // ==================================================
  // CRUD TIMETASK OPERATIONS
  // ==================================================

  public getAllTimeElements(): Observable<TimeTask[]> {
    return this.httpClient.get<Array<TimeTask>>(this.url);
  }

  public getTimeElementByID(id: number): Observable<TimeTask[]> {
    return this.httpClient.get<Array<TimeTask>>(this.url + '/' + id);
  }

  public postTimeElement(zeitElement: TimeTask): Observable<TimeTask> {
    return this.httpClient.post<TimeTask>(this.url, zeitElement);
  }

  public putTimeElement(zeitElement: TimeTask): Observable<TimeTask> {
    return this.httpClient.put<TimeTask>(
      this.url + '/' + zeitElement.id,
      zeitElement
    );
  }

  public deleteTimeElement(zeitElement: number): Observable<TimeTask> {
    return this.httpClient.delete<TimeTask>(this.url + '/' + zeitElement);
  }

  // ==================================================
  // OTHER TIMETASK OPERATIONS
  // ==================================================

  /*
   * Checks if a timetask is valid and can be displayed
   */
  public isValid(timetask: TimeTask) {
    return (
      timetask.startdate !== undefined &&
      timetask.enddate !== undefined &&
      new Date(timetask.enddate).getTime() >
        new Date(timetask.startdate).getTime()
    );
  }

  /*
   * Get all TimeTasks that have today as startdate
   * Return sorted TimeTask array
   */
  public getTodayTimeTasks(data: TimeTask[]): TimeTask[] {
    return data
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

  /*
   * Calculate the overall work time for the current day
   */
  public calculateTodayTime(data: TimeTask[]): number {
    return data
      .filter(
        (e) =>
          e.startdate !== undefined &&
          e.enddate !== undefined &&
          new Date(e.enddate).getTime() > new Date(e.startdate).getTime()
      )
      .filter(
        (f) =>
          this.utilityService.objectHasPropertyWithValue(f, 'startdate') &&
          this.utilityService.objectHasPropertyWithValue(f, 'enddate')
      )
      .map(
        (g) => new Date(g.enddate).getTime() - new Date(g.startdate).getTime()
      )
      .reduce((a, b) => a + b, 0);
  }

  /*
   * Calculate the overall time for the current week
   */
  public calculateOverallTime(data: TimeTask[]): number {
    return data
      .filter((e) => this.isValid(e))
      .filter(
        (f) =>
          this.utilityService.objectHasPropertyWithValue(f, 'startdate') &&
          this.utilityService.objectHasPropertyWithValue(f, 'enddate') &&
          this.timeService.calculateCurrentWeekNumber() ===
            this.timeService.calculateWeekNumberForDate(new Date(f.startdate))
      )
      .map(
        (filteredData) =>
          new Date(filteredData.enddate).getTime() -
          new Date(filteredData.startdate).getTime()
      )
      .reduce((a, b) => a + b, 0);
  }

  /*
   * Calculate the overall time for each timetask that that data can be grouped together
   */
  public getAccumulatedTimeTaskAndSecondsPairs(
    data: TimeTask[]
  ): NameAndNumberPair[] {
    const array: NameAndNumberPair[] = [];

    data.forEach((key) => {
      const element: NameAndNumberPair = {
        name: key.shortdescr, // name of timetask as string
        value: data
          .filter((e) => e.shortdescr === key.shortdescr)
          .reduce(
            (a, b) =>
              a +
              (new Date(b.enddate).getTime() - new Date(b.startdate).getTime()),
            0
          ),
      };
      if (array.filter((e) => e.name === element.name).length === 0) {
        array.push(element);
      }
    });

    return array;
  }
}
