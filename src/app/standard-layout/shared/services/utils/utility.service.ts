import { Injectable } from '@angular/core';

const NEW_LINE = '\n';

@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  constructor() {}

  /*
   * Split string based on new line
   */
  public split(str: string): string[] {
    return str.split(NEW_LINE);
  }

  /*
   * Checks if the input parameter is a number
   */
  public isNumber(input: any): boolean {
    return !isNaN(Number(input));
  }

  /*
   * When number has only one digit
   * then add a 0 in front
   */
  public formatToTwoDigits(num: number) {
    return num < 10 ? `0${num}` : num;
  }

  /*
   * Create random interval with min and max values
   */
  public randomIntFromInterval(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  // ==================================================
  // SORTING
  // ==================================================

  /*
   * Sort items numerically
   */
  public sortNumerical(a: number, b: number): number {
    return a > b ? -1 : 1;
  }

  /*
   * Sort items alphabetically
   */
  public sortAlphabetical(a: string, b: string): number {
    return a > b ? 1 : -1;
  }

  /*
   * Only show distinct elements
   */
  public sortDistinct(value, index, self): boolean {
    return self.indexOf(value) === index;
  }

  // ==================================================
  // OBJECTS
  // ==================================================

  /*
   * Checks if an object has the specified property
   */
  public objectHasPropertyWithValue(object: any, property: string): boolean {
    if (
      object.hasOwnProperty(property) &&
      object[property] !== null &&
      object[property] !== undefined
    ) {
      return true;
    }

    return false;
  }

  // ==================================================
  // ARRAY
  // ==================================================

  /*
   * Remove element in array with position
   */
  public removePositionFromArray(elementPosition: number, array: any[]) {
    array.splice(elementPosition, 1);
  }

  /*
   * Remove element in array with element
   */
  public removeElementFromArray(element: any, array: any[]) {
    array.splice(array.indexOf(element), 1);
  }

  /*
   * Change element order in array with direction and index
   */
  public changeElementOrderInArray(
    array: any[],
    direction: string,
    index: number
  ) {
    const actualElement: number = index;
    const lastElement: number = index - 1;
    const nextElement: number = index + 1;

    switch (direction) {
      case 'up':
        if (index !== 0) {
          const tempLast = array[lastElement];
          array[lastElement] = array[actualElement];
          array[actualElement] = tempLast;
        } else {
          console.warn(
            `First element in array ${array} cannot be moved further up to index ${
              index - 1
            }. Array from 0 to ${array.length - 1}
            `
          );
        }
        break;
      case 'down':
        if (actualElement < array.length - 1) {
          const tempNext: any = array[nextElement];
          array[nextElement] = array[actualElement];
          array[actualElement] = tempNext;
        } else {
          console.warn(
            `Last element in array ${array} cannot be moved further down to index ${
              index + 1
            }. Array from 0 to ${array.length + 1}
            `
          );
        }
        break;
      default:
        console.warn('Wrong direction selected');
    }
  }
}
