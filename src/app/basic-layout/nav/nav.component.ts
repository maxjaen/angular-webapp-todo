import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { SettingsService } from 'src/app/standard-layout/shared/services/core/settings.service';
import { Settings } from 'src/app/standard-layout/core/settings/model/settings';
import { ThemeService } from 'src/app/standard-layout/shared/services/utils/theme.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit {
  settings: Settings;

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    private settingsService: SettingsService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.themeService.setTheme('blue');
    this.getSettings();
  }

  private getSettings() {
    this.settingsService.getSettings().subscribe(settings => {
      this.settings = settings[0];
    });
    // react on changed settings
    this.settingsService.settings.subscribe({
      next: (settings) => this.settings = settings
    });
  }

  public unFocusAfterClick() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }
}
