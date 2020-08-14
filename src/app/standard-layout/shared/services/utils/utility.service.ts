import { Injectable } from '@angular/core';
import { Direction } from '../../model/Enums';

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

  public sortDistinct(value, index, self): boolean {
    return self.indexOf(value) === index;
  }

  public objectHasPropertyWithValue(object: any, property: string): boolean {
    return (
      object.hasOwnProperty(property) &&
      object[property] !== null &&
      object[property] !== undefined
    );
  }

  public removeElementFromArray(element: any, array: any[]) {
    array.splice(array.indexOf(element), 1);
  }

  public removeElementOnPositionFromArray(
    elementPosition: number,
    array: any[]
  ) {
    array.splice(elementPosition, 1);
  }

  public changeElementOrderInArray(
    array: any[],
    direction: Direction,
    index: number
  ) {
    const actualElement: number = index;
    const lastElement: number = index - 1;
    const nextElement: number = index + 1;

    switch (direction) {
      case Direction.UP:
        if (index !== 0) {
          const tempLast = array[lastElement];
          array[lastElement] = array[actualElement];
          array[actualElement] = tempLast;
        } else {
          console.warn(
            `First element in array cannot be moved further up to index ${
              index - 1
            }.`
          );
        }
        break;
      case Direction.DOWN:
        if (actualElement < array.length - 1) {
          const tempNext: any = array[nextElement];
          array[nextElement] = array[actualElement];
          array[actualElement] = tempNext;
        } else {
          console.warn(
            `Last element in array cannot be moved further down to index ${
              index + 1
            }.`
          );
        }
        break;
      default:
        console.warn('Wrong direction selected');
    }
  }
}
