import { Injectable } from '@angular/core';
import { Color } from '../../model/Enums';
import colors from '../../../../../assets/json/colors.json';
import translation from '../../../../../assets/json/translations.json';
import shortcuts from '../../../../../assets/json/shortcuts.json';
import sections from '../../../../../assets/json/sections.json';

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

    public getColor(color: Color): string {
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

    public getSections(): any {
        return sections.sections;
    }
}
