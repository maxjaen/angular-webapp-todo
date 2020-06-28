import { Injectable } from "@angular/core";
import colors from "../../../../assets/json/colors.json";
import strings from "../../../../assets/json/strings.json";

@Injectable({
  providedIn: "root",
})
export class KeyService {
  constructor() {}

  // TODO work on shortcuts
  SHORTCUTS = [
    ["<pr>", "PROBLEM: "],
    ["<SO>", "SOLUTION: "],
    ["<ag>", "AGENDA: "],
    ["<la>", "LATER: "],
    ["<do>", "TODO: "],
    ["<fi>", "FINISHED: "],
  ];

  getColor(color: string): string {
    return colors[color];
  }

  getColors(): any {
    return colors;
  }

  getString(string: string): string {
    return strings[string];
  }

  getStrings(): any {
    return strings;
  }
}
