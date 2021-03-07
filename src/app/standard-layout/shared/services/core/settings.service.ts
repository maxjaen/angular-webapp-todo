import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Settings } from '../../../core/settings/model/settings';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

const SETTINGS_URL = 'http://localhost:3000/settings';

@Injectable({
    providedIn: 'root',
})
export class SettingsService {

    public settings = new BehaviorSubject(null);

    constructor(private httpClient: HttpClient) {}

    public getSettings(): Observable<Settings[]> {
        return this.httpClient.get<Array<Settings>>(SETTINGS_URL);
    }

    public putSettings(settings: Settings): Observable<Settings> {
        return this.httpClient.put<Settings>(
            SETTINGS_URL + '/' + settings.id,
            settings
        );
    }
}
