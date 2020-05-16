import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class StringDistributorService {
  constructor() {}

  COLORS: Colors = new Colors();

  SHORTCUTS = [
    ["<pr>", "PROBLEM: "],
    ["<SO>", "SOLUTION: "],
    ["<ag>", "AGENDA: "],
    ["<la>", "LATER: "],
    ["<do>", "TODO: "],
    ["<fi>", "FINISHED: "],
  ];
}

// https://coolors.co/

export class Colors {
  constructor() {}

  BLACK = "#000000";
  WHITE = "#ffffff";
  PINK = "#c936c4";
  VIOLET = "#6e36c9";
  BLUE = "#27548c";
  CYAN = "#2f98af";
  DARKGREEN = "#329327";
  LIGHTGREEN = "#95C936";
  YELLOW = "#aa982e";
  ORANGE = "#C97136";
  RED = "#C93636";
  DARKGRAY = "#424242";
  HOVERDAKGRAY = "#464545";
}
