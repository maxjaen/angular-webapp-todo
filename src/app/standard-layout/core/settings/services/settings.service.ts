import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Settings } from "../model/settings";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SettingsService {
  url = "http://localhost:3000/settings";

  constructor(private httpClient: HttpClient) {}

  getAllSettings(): Observable<Settings[]> {
    return this.httpClient.get<Array<Settings>>(this.url);
  }

  putSettings(settings: Settings): Observable<Settings> {
    return this.httpClient.put<Settings>(
      this.url + "/" + settings.id,
      settings
    );
  }

  getStartPageHeaders(settings: Settings[]) {
    return settings[0]["startpage"];
  }

  getSettingsHeaders(settings: Settings[]) {
    return settings[0]["settingsmenu"];
  }

  getSettingsValue(settings: Settings[], key: string): string {
    let array = [];

    this.getSettingsHeaders(settings).forEach((header) => {
      array = [...array, ...header.settings];
    });

    return array.filter((settingsItem) => settingsItem.displaytext == key)[0]
      .value;
  }
}
