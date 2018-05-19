import * as d3 from 'd3';
import { AndroidFullScreen } from '@ionic-native/android-full-screen';
import { Component } from '@angular/core';
import { ConfigService } from '../services/configService';
import { ClockContainerPage } from '../pages/clockContianer/clockContainer';
import { Insomnia } from '@ionic-native/insomnia';
import { Platform } from 'ionic-angular';
import { Theme } from '../constants';
import { getBackgroundColor } from '../util/util';

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    rootPage:any = ClockContainerPage;

    constructor(
        private androidFullScreen: AndroidFullScreen,
        private configService: ConfigService,
        insomnia: Insomnia,
        platform: Platform,
    ) {
        document.addEventListener("deviceready", () => {
            insomnia.keepAwake();
        });

        document.addEventListener("resume", () => {
            insomnia.keepAwake();
        });

        document.addEventListener("pause", () => {
            insomnia.allowSleepAgain();
        });

        this.configService.appReady().then(() => {
            this.configService.subscribeThemeChange(this.setTheme);
            this.configService.subscribeFullScreenModeChange(this.updateFullscreenMode);

            this.setTheme(this.configService.getTheme());
            this.updateFullscreenMode(this.configService.isInFullScreenMode());
        });
    }

    private updateFullscreenMode = (useFullScreenMode: boolean): void => {
        if (useFullScreenMode) {
            this.androidFullScreen.immersiveMode();
        } else {
            this.androidFullScreen.showSystemUI();
        }
    }

    private setTheme = (theme: Theme): void => {
        const color = getBackgroundColor(theme);
        d3.select('ion-app')
            .style('background-color', color);
        d3.select('ion-nav')
            .style('background-color', color);
    }
}

