import { Injectable } from '@angular/core';
import { StyleManagerService } from './style-manager.service';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {

    constructor(private styleManager: StyleManagerService) {}

    public setTheme(theme: string) {
        this.styleManager.setStyle('theme', `/assets/themes/${theme}.css`);
    }
}
