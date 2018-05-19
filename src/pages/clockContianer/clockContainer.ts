import * as d3 from 'd3';
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ConfigService } from '../../services/configService';
import { SettingsPage } from '../settings/settings';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Theme, ClockEvent, TIPS } from '../../constants'
import { getBackgroundColor } from '../../util/util';
import { Subject } from 'rxjs';
import { ToastController } from 'ionic-angular';

const PRESS_TRIGGER_COUNT = 5;

@Component({
    selector: 'clock-container',
    templateUrl: 'clockContainer.html'
})
export class ClockContainerPage {
    private clockEvent$ = new Subject<ClockEvent>();

    private currentClockFace: number;
    private onCurrentClockFaceChange = (clockFace) => {
        this.currentClockFace = Number(clockFace);
    }
    private pressCount = 0;

    constructor(
        private configService: ConfigService,
        private nav: NavController,
        private toastCtrl: ToastController,
        private splashScreen: SplashScreen,
    ) {
        this.configService.appReady()
            .then(() => {
                this.configService.subscribeCurrentFaceChange(this.onCurrentClockFaceChange);
            });
    }

    ionViewDidLoad() {
        this.configService.appReady()
            .then(() => {
                this.configService.subscribeThemeChange(this.setTheme);
            });
    }

    ionViewWillEnter() {
        this.configService.appReady()
            .then(() => {
                this.clockEvent$.next(ClockEvent.RESUME);
            })
            .then(() => {
                this.splashScreen.hide();
            });
    }

    ionViewDidEnter() {
        this.configService.appReady()
            .then(() => {
                if (this.configService.isFirstTimeOpen()) {
                    const toast = this.toastCtrl.create({
                        message: TIPS,
                        showCloseButton: true,
                        closeButtonText: 'Ok'
                    });
                    toast.present();
                    this.configService.setFirstTimeOpen(false);
                }
           });
    }

    ionViewWillLeave() {
        this.configService.appReady()
            .then(() => {
                this.clockEvent$.next(ClockEvent.PAUSE);
            });
    }

    setTheme = (theme: Theme): void => {
        const color = getBackgroundColor(theme);
        d3.select('ion-content.clock-container')
            .style('background-color', color);
        d3.select('ion-content.clock-container>.scroll-content')
            .style('background-color', color);
    }

    tapEvent(event: Event): void {
        this.pressCount++;
        if (this.pressCount >= PRESS_TRIGGER_COUNT) {
            this.pressCount = 0;
            this.nav.push(SettingsPage);
        }
    }
}
