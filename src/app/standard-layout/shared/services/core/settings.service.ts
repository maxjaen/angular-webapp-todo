import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Settings } from '../../../core/settings/model/settings';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private url = 'http://localhost:3000/settings';

  constructor(private httpClient: HttpClient) {}

  public getSettings(): Observable<Settings[]> {
    return this.httpClient.get<Array<Settings>>(this.url);
  }

  public putSettings(settings: Settings): Observable<Settings> {
    return this.httpClient.put<Settings>(
      this.url + '/' + settings.id,
      settings
    );
  }

  public getStartPageHeaders(settings: Settings[]) {
    return settings[0]['startPage'];
  }

  public getSettingsHeaders(settings: Settings[]) {
    return settings[0]['settingsMenu'];
  }

  /*
   * Get settings value from input key
   */
  public getSettingsValue(settings: Settings[], key: string): any {
    let array = [];

    this.getSettingsHeaders(settings).forEach((header) => {
      array = [...array, ...header.settings];
    });

    return array.filter((settingsItem) => settingsItem.displaytext === key)[0]
      .value;
  }
}
