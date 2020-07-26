import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Settings } from "../../../core/settings/model/settings";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SettingsService {
  url = "http://localhost:3000/settings";

  constructor(private httpClient: HttpClient) {}

  // ===================================================================================
  // CRUD SETTINGS OPERATIONS
  // ===================================================================================

  public getAllSettings(): Observable<Settings[]> {
    return this.httpClient.get<Array<Settings>>(this.url);
  }

  public putSettings(settings: Settings): Observable<Settings> {
    return this.httpClient.put<Settings>(
      this.url + "/" + settings.id,
      settings
    );
  }

  // ===================================================================================
  // OTHER SETTINGS OPERATIONS
  // ===================================================================================

  /*
   * Get all startpage headers
   */
  public getStartPageHeaders(settings: Settings[]) {
    return settings[0]["startpage"];
  }

  /*
   * Get all Settings headers
   */
  public getSettingsHeaders(settings: Settings[]) {
    return settings[0]["settingsmenu"];
  }

  /*
   * Get settings value from input key
   */
  public getSettingsValue(settings: Settings[], key: string): any {
    let array = [];

    this.getSettingsHeaders(settings).forEach((header) => {
      array = [...array, ...header.settings];
    });

    return array.filter((settingsItem) => settingsItem.displaytext == key)[0]
      .value;
  }
}
