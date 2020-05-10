import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { SettingsService } from "./services/settings.service";
import { Settings } from "./model/settings";
import { MatSnackBar } from "@angular/material";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent implements OnInit {
  settings: Settings[] = [];

  constructor(
    private settingsService: SettingsService,
    private _tabTitle: Title,
    private _snackBar: MatSnackBar
  ) {
    this._tabTitle.setTitle("Settings");
  }

  ngOnInit(): void {
    this.getSettingsFromService();
  }

  // Get all settings from service
  getSettingsFromService() {
    this.settingsService.getAllSettings().subscribe((settings) => {
      this.settings = settings;
    });
  }

  getSettingTitles() {
    return this.settings[0]["settingsmenu"];
  }

  saveSettings() {
    this.settingsService.putSettings(this.settings[0]).subscribe(() => {
      this.openSnackBar("Settings saved!", null);
      window.location.reload();
    });
  }

  toogleSlider(setting: any, event: any) {
    this.getSettingTitles()
      .map((e) => e["settings"])
      .forEach((element) => {
        element.forEach((e) => {
          if (e["displaytext"] == setting["displaytext"]) {
            e["value"] = event["checked"];
          }
        });
      });
  }

  /*
   * ===================================================================================
   * HELPER FUNCTIONS
   * ===================================================================================
   */

  // Opens popup menu for notifications
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 4000,
    });
  }
}
