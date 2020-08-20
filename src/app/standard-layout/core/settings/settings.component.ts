import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SettingsService } from '../../shared/services/core/settings.service';
import { Settings } from './model/settings';
import { MatSnackBar } from '@angular/material';
import { KeyService } from '../../shared/services/utils/key.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  settings: Settings[] = [];

  constructor(
    public settingsService: SettingsService,
    private keyService: KeyService,
    private tabTitleService: Title,
    private snackBarService: MatSnackBar
  ) {
    this.tabTitleService.setTitle(this.keyService.getKeyTranslation('s1'));
  }

  ngOnInit(): void {
    this.initSettings();
  }

  private initSettings() {
    this.settingsService.getSettings().subscribe((settings) => {
      this.settings = settings;
    });
  }

  public saveSettings() {
    this.settingsService.putSettings(this.settings[0]).subscribe(() => {
      this.displayNotification(this.keyService.getKeyTranslation('s2'), null);
      window.location.reload();
    });
  }

  /**
   * Switch setting on/off when clicking on slider
   * @param setting to be changed
   * @param event toggle event on user interface
   */
  public toggleSlider(setting: any, event: any) {
    this.settings[0]['settingsMenu']
      .map((e) => e['settings'])
      .forEach((element) => {
        element.forEach((e) => {
          if (e['displaytext'] === setting['displaytext']) {
            e['value'] = event['checked'];
          }
        });
      });
  }

  /**
   * Opens popup menu to show new notifications on user interface
   * @param message to be displayed
   * @param action to be taken
   */
  private displayNotification(message: string, action: string) {
    this.snackBarService.open(message, action, {
      duration: 4000,
    });
  }
}
