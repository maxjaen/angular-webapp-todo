import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Settings } from '../../../core/settings/model/settings';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private url = 'http://localhost:3000/settings';
  public settings = new BehaviorSubject(null);

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
}
