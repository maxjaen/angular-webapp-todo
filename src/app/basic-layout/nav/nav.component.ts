import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { SettingsService } from 'src/app/standard-layout/shared/services/core/settings.service';
import { Settings } from 'src/app/standard-layout/core/settings/model/settings';
import { ThemeService } from 'src/app/standard-layout/shared/services/utils/theme.service';
import { newDate } from 'src/app/standard-layout/shared/utils/TimeUtils';

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit {

    public settings: Settings;
    public time = newDate();

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
        this.themeService.setTheme('main');

        this.initSettings();
        this.updateClock();
    }

    public unFocusAfterClick() {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    }

    private initSettings() {
        this.settingsService.getSettings().subscribe((settings) => {
            this.settings = settings[0];
        });
        this.reactOnSettingsChanged();
    }

    private reactOnSettingsChanged() {
        this.settingsService.settings.subscribe(
            settings => this.settings = settings
        );
    }

    private updateClock() {
        setInterval(() => {
            this.time = newDate();
        }, 1000);
    }
}
