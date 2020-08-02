import { Injectable } from '@angular/core';
import colors from '../../../../../assets/json/colors.json';
import translation from '../../../../../assets/json/translations.json';
import shortcuts from '../../../../../assets/json/shortcuts.json';

@Injectable({
  providedIn: 'root',
})
export class KeyService {
  constructor() {}

  public getShortcut(shortcut: string): string {
    return shortcuts[shortcut];
  }

  public getShortcuts(): any {
    return shortcuts;
  }

  public getColor(color: string): string {
    return colors[color];
  }

  public getColors(): any {
    return colors;
  }

  public getKeyTranslation(key: string): string {
    return translation[key];
  }

  public getKeyTranslations(): any {
    return translation;
  }
}
