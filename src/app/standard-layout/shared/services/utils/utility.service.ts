import { Injectable } from '@angular/core';

const NEW_LINE = '\n';

@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  constructor() {}

  public splitWithNewLine(str: string): string[] {
    return str.split(NEW_LINE);
  }

  public isNumber(input: any): boolean {
    return !isNaN(Number(input));
  }

  public formatToTwoDigits(num: number) {
    return num < 10 ? `0${num}` : num;
  }

  public randomIntFromInterval(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  public sortNumerical(a: number, b: number): number {
    return a > b ? -1 : 1;
  }

  public sortAlphabetical(a: string, b: string): number {
    return a > b ? 1 : -1;
  }

  public sortDistinct(value: any, index: any, self: any): boolean {
    return self.indexOf(value) === index;
  }

  public objectHasPropertyWithValue(object: any, property: string): boolean {
    return (
      object.hasOwnProperty(property) &&
      object[property] !== null &&
      object[property] !== undefined
    );
  }

  public removeFromArray(index: number, array: any[]): any[] {
    return array.splice(index, 1);
  }
}
