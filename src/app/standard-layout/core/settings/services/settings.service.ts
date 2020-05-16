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
}
