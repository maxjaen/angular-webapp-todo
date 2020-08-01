import { Injectable } from '@angular/core';
import colors from '../../../../../assets/json/colors.json';
import strings from '../../../../../assets/json/strings.json';
import shortcuts from '../../../../../assets/json/shortcuts.json';

@Injectable({
  providedIn: 'root',
})
export class KeyService {
  constructor() {}

  /*
   * Get shortcut from JSON based on input name of shortcut
   */
  public getShortcut(shortcut: string): string {
    return shortcuts[shortcut];
  }

  /*
   * Get all shortcuts from JSON
   */
  public getShortcuts(): any {
    return shortcuts;
  }

  /*
   * Get color from JSON based on input name of color
   */
  public getColor(color: string): string {
    return colors[color];
  }

  /*
   * Get all colors from JSON
   */
  public getColors(): any {
    return colors;
  }

  /*
   * Get key from JSON based on input name of key
   */
  public getString(str: string): string {
    return strings[str];
  }

  /*
   * Get all keys from JSON
   */
  public getStrings(): any {
    return strings;
  }
}
