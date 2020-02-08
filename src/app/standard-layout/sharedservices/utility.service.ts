import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class UtilityService {
  constructor() {}

  propertyHasValue(object: any, property: string): boolean {
    if (
      object.hasOwnProperty(property) &&
      object[property] !== null &&
      object[property] !== undefined
    ) {
      return true;
    }

    return false;
  }

  splitToBulletPoints(str: string) {
    return str.split("\n");
  }

  formatToTwoDigits(num: number) {
    return num < 10 ? "0" + num : num;
  }

  getDayString(num: number): string {
    return [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ][num];
  }

  randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  isNumber(param: any): boolean {
    return !isNaN(Number(param));
  }

  isToday(date: Date): boolean {
    let temp = new Date();

    if (
      date.getDate() == temp.getDate() &&
      date.getMonth() == temp.getMonth() &&
      date.getFullYear() == temp.getFullYear()
    ) {
      return true;
    }

    return false;
  }

  removePositionFromArray(elementPosition: number, array: any[]) {
    array.splice(elementPosition, 1);
  }
  removeElementFromArray(element: any, array: any[]) {
    array.splice(array.indexOf(element), 1);
  }

  changeOrder(array: any[], direction: string, index: number) {
    let actualElement: number = index;
    let lastElement: number = index - 1;
    let nextElement: number = index + 1;

    switch (direction) {
      case "up":
        if (index !== 0) {
          var temp = array[lastElement];
          array[lastElement] = array[actualElement];
          array[actualElement] = temp;
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
          var temp: any = array[nextElement];
          array[nextElement] = array[actualElement];
          array[actualElement] = temp;
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
