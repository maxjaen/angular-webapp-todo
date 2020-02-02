import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class UtilityService {
  constructor() {}

  toBulletPoints(str: string) {
    let stringArray = str.split("\n");
    return stringArray;
  }

  isNumber(param: any): boolean {
    return !isNaN(Number(param));
  }

  changeTasksOrder(array: any[], direction: string, index: number) {
    let actualElement: number = index;
    let lastElement: number = index - 1;
    let nextElement: number = index + 1;

    switch (direction) {
      case "oben":
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
      case "unten":
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
