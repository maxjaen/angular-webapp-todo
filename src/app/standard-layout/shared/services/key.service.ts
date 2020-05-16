import { Injectable } from "@angular/core";
import colors from "../../../../assets/json/colors.json";

@Injectable({
  providedIn: "root",
})
export class KeyService {
  constructor() {}

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
}
