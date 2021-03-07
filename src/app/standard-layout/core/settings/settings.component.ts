import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SettingsService } from '../../shared/services/core/settings.service';
import { Settings } from './model/settings';
import { KeyService } from '../../shared/services/utils/key.service';
import { BaseSetting } from './model/base-setting';
import { sortDistinct } from '../../shared/utils/CommonUtils';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {

    public settings: Settings;

    constructor(
        public settingsService: SettingsService,
        private keyService: KeyService,
        private title: Title
    ) {
        this.title.setTitle(this.keyService.getKeyTranslation('s1'));
    }

    ngOnInit() {
        this.initSettings();
    }

    public getBaseSettingsList(): BaseSetting[] {
        const list: BaseSetting[] = [];
        Object.getOwnPropertyNames(this.settings)
            .map((e) => this.settings[e])
            .forEach((e) => {
                Object.getOwnPropertyNames(e).forEach((f) => list.push(e[f]));
            });
        return list;
    }

    public getBaseListCategories(): string[] {
        return this.getBaseSettingsList()
            .map((e) => e.category)
            .filter(sortDistinct);
    }

    public getBaseSettingsListByCategory(category: string): BaseSetting[] {
        return this.getBaseSettingsList().filter(
            (baseSetting) => baseSetting.category === category
        );
    }

    /**
     * Switch settings on and off when triggering the slider on the user
     * interface.
     *
     * @param setting The setting that will be triggered on the UI.
     * @param event The toggle event that indicates that the slider has changed
     * its internal value.
     */
    public toggleSlider(setting: BaseSetting) {
        setting.value = !setting.value;

        // multicast settings change
        this.settingsService.settings.next(this.settings);
        // save changed settings to database
        this.settingsService.putSettings(this.settings).subscribe();
    }

    private initSettings() {
        this.settingsService.getSettings().subscribe((settings) => {
            this.settings = settings[0];
        });
    }
}
