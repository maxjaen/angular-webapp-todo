import { Injectable } from "@angular/core";

const NEW_LINE = "\n";

@Injectable({
  providedIn: "root",
})
export class UtilityService {
  constructor() {}

  /*
   * Split string based on new line
   */
  split(string: string): string[] {
    return string.split(NEW_LINE);
  }

  /*
   * Checks if the input parameter is a number
   */
  isNumber(input: any): boolean {
    return !isNaN(Number(input));
  }

  /*
   * When number has only one digit
   * then add a 0 in front
   */
  formatToTwoDigits(number: number) {
    return number < 10 ? `0${number}` : number;
  }

  /*
   * Create random interval with min and max values
   */
  randomIntFromInterval(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  // ==================================================
  // SORTING
  // ==================================================

  /*
   * Sort items numerically
   */
  sortNumerical(a: number, b: number): number {
    if (a > b) return -1;
    if (a < b) return 1;
    else return 0;
  }

  /*
   * Only show distinct elements
   */
  sortDistinct(value, index, self): boolean {
    return self.indexOf(value) === index;
  }

  /*
   * Checks if an object has the specified property
   */
  objectHasPropertyWithValue(object: any, property: string): boolean {
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
  removePositionFromArray(elementPosition: number, array: any[]) {
    array.splice(elementPosition, 1);
  }

  /*
   * Remove element in array with element
   */
  removeElementFromArray(element: any, array: any[]) {
    array.splice(array.indexOf(element), 1);
  }

  /*
   * Change element order in array with direction and index
   */
  changeElementOrderInArray(array: any[], direction: string, index: number) {
    let actualElement: number = index;
    let lastElement: number = index - 1;
    let nextElement: number = index + 1;

    switch (direction) {
      case "up":
        if (index !== 0) {
          var tempLast = array[lastElement];
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
      case "down":
        if (actualElement < array.length - 1) {
          var tempNext: any = array[nextElement];
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
        console.warn("Wrong direction selected");
    }
  }
}
