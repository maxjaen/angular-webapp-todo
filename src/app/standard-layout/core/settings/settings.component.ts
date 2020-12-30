import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SettingsService } from '../../shared/services/core/settings.service';
import { Settings } from './model/settings';
import { KeyService } from '../../shared/services/utils/key.service';
import { BaseSetting } from './model/base-setting';
import { UtilityService } from '../../shared/services/utils/utility.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  settings: Settings;

  constructor(
    public settingsService: SettingsService,
    private utilityService: UtilityService,
    private keyService: KeyService,
    private tabTitleService: Title
  ) {
    this.tabTitleService.setTitle(this.keyService.getKeyTranslation('s1'));
  }

  ngOnInit(): void {
    this.initSettings();
  }

  private initSettings() {
    this.settingsService.getSettings().subscribe((settings) => {
      this.settings = settings[0];
    });
  }

  public getBaseSettingsList() {
    const list: BaseSetting[] = [];
    Object.getOwnPropertyNames(this.settings).map(e => this.settings[e]).forEach(e => {
      Object.getOwnPropertyNames(e).forEach(f => list.push(e[f]));
    });
    return list;
  }

  public getBaseListCategories() {
    return this.getBaseSettingsList().map(e => e.category).filter(this.utilityService.sortDistinct);
  }

  public getBaseSettingsListByCategory(category: string): BaseSetting[] {
    return this.getBaseSettingsList().filter(baseSetting => baseSetting.category === category);
  }

  /**
   * Switch setting on/off when clicking on slider
   * @param setting to be changed
   * @param event toggle event on user interface
   */
  public toggleSlider(setting: BaseSetting) {
    setting.value = !setting.value;
  
    this.settingsService.settings.next(this.settings); // multicast settings change
    this.settingsService.putSettings(this.settings).subscribe(); // save changed settings to database
  }
}
