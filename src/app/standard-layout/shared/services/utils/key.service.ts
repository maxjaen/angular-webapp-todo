import { Injectable } from "@angular/core";
import colors from "../../../../../assets/json/colors.json";
import strings from "../../../../../assets/json/strings.json";
import shortcuts from "../../../../../assets/json/shortcuts.json";

@Injectable({
  providedIn: "root",
})
export class KeyService {
  constructor() {}

  getShortcut(shortcut: string): string {
    return shortcuts[shortcut];
  }

  getShortcuts(): any {
    return shortcuts;
  }

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
