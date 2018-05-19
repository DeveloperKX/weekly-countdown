import { Component } from '@angular/core';
import { ConfigService } from '../../services/configService';
import { ClockFaceId, ClockFaceProperty, Theme, WeekDay } from '../../constants';
import { Version } from '../../version';

@Component({
    selector: 'settings',
    templateUrl: 'settings.html'
})
export class SettingsPage {
    readonly ClockFaceId = ClockFaceId;
    readonly WeekDay = WeekDay;
    readonly Theme = Theme;

    private selectedClockFace: string;
    private selectedTheme: string;
    private isFullScreen: boolean;
    private selectedWeekStartDay: string;
    private versionNumber: string;

    constructor(
        private configService: ConfigService
    ) {
        this.selectedClockFace = String(this.ClockFaceId.Rainbow);
        this.selectedTheme = String(this.Theme.Yellow);
        this.isFullScreen = false;
        this.selectedWeekStartDay = String(this.WeekDay.Monday);
        this.versionNumber = Version;

        this.configService.appReady()
            .then(() => {
                this.selectedClockFace = String(configService.getClockFace());
                this.selectedTheme = String(configService.getTheme());
                this.isFullScreen = configService.isInFullScreenMode();
                this.selectedWeekStartDay = String(configService.getWeekStartDay());
            });
    }

    updateFullScreen(): void {
        this.configService.setFullScreenMode(this.isFullScreen);
    }

    onSelectClockFace(): void {
        this.configService.setClockFace(Number(this.selectedClockFace));
    }

    onSelectTheme(): void {
        this.configService.setTheme(Number(this.selectedTheme));
    }

    onSelectWeekStartDay(): void {
        this.configService.setWeekStartDay(Number(this.selectedWeekStartDay));
    }

    // helpers
    isThemeSupported(): boolean {
        return this.selectedClockFace
            && ClockFaceProperty[this.selectedClockFace]
            && ClockFaceProperty[this.selectedClockFace].SupportTheme;
    }

    isWeekStartDaySupported(): boolean {
        return this.selectedClockFace
            && ClockFaceProperty[this.selectedClockFace]
            && ClockFaceProperty[this.selectedClockFace].SupportWeekStartDay;
    }
}
