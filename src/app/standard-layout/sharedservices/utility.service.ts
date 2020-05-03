import { Injectable } from "@angular/core";

const NEW_LINE = "\n";

@Injectable({
  providedIn: "root",
})
export class UtilityService {
  constructor() {}

  // Seperates string by a specific character
  // Return an array of strings
  split(string: string) {
    return string.split(NEW_LINE);
  }

  // Formate one digit numbers to two digit numbers
  // Returns two digit numbers
  formatToTwoDigits(number: number) {
    return number < 10 ? "0" + number : number;
  }

  // Get specific day of the week
  // Returns week day based on input number
  getDayString(number: number): string {
    return [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ][number];
  }

  // Create random number based on intervall parameters
  // Returns random number
  randomIntFromInterval(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  // Checks if input parameter is a number
  // Returns true, when parameter is a number, otherwise false
  isNumber(input: any): boolean {
    return !isNaN(Number(input));
  }

  // Checks if an input parameters date is the actual date
  // Returns true, when it's the actual date, otherwise false
  isToday(unknownDate: Date): boolean {
    let actualDate = new Date();

    if (
      unknownDate.getDate() == actualDate.getDate() &&
      unknownDate.getMonth() == actualDate.getMonth() &&
      unknownDate.getFullYear() == actualDate.getFullYear()
    ) {
      return true;
    }

    return false;
  }

  // Sort function for numerical values
  // otherwise standard sort would be alphabetical
  sortNumerical(a: number, b: number) {
    if (a < b) return -1;
    if (a < b) return 1;
    else return 0;
  }

  // Checks if an object has the a specific property
  // Return true if object has property, otherwise false
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

  // Removes the element on a specific position from the array
  removePositionFromArray(elementPosition: number, array: any[]) {
    array.splice(elementPosition, 1);
  }

  // Removes specific element from array
  removeElementFromArray(element: any, array: any[]) {
    array.splice(array.indexOf(element), 1);
  }

  // Changes the index of an element in a array
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
            "First element in array " +
              array +
              " cannot be moved further up to index " +
              (index - 1) +
              ". Array from 0 to " +
              (array.length - 1)
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
            "Last element in array " +
              array +
              "cannot be moved further down to index " +
              (index + 1) +
              ". Array from 0 to " +
              (array.length - 1)
          );
        }
        break;
      default:
        console.warn("Wrong direction selected");
    }
  }
}
