import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { SettingsService } from "./services/settings.service";
import { Settings } from "./model/settings";
import { MatSnackBar } from "@angular/material";
import { KeyService } from "../../shared/services/key.service";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent implements OnInit {
  settings: Settings[] = [];

  constructor(
    private keyService: KeyService,
    public settingsService: SettingsService,
    private _tabTitle: Title,
    private _snackBar: MatSnackBar
  ) {
    this._tabTitle.setTitle(this.keyService.getString("s1"));
  }

  ngOnInit(): void {
    this.getSettingsFromService();
  }

  /*
   * ===================================================================================
   * GET DATA
   * ===================================================================================
   */

  getSettingsFromService() {
    this.settingsService.getAllSettings().subscribe((settings) => {
      this.settings = settings;
    });
  }

  saveSettings() {
    this.settingsService.putSettings(this.settings[0]).subscribe(() => {
      this.openSnackBar(this.keyService.getString("s2"), null);
      window.location.reload();
    });
  }

  /*
   * ===================================================================================
   * HELPER FUNCTIONS
   * ===================================================================================
   */

  // Switch setting on/off when clicking on slider
  toogleSlider(setting: any, event: any) {
    this.settings[0]["settingsmenu"]
      .map((e) => e["settings"])
      .forEach((element) => {
        element.forEach((e) => {
          if (e["displaytext"] == setting["displaytext"]) {
            e["value"] = event["checked"];
          }
        });
      });
  }

  // Opens popup menu for notifications
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 4000,
    });
  }
}
