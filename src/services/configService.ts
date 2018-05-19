import { AndroidFullScreen } from '@ionic-native/android-full-screen';
import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { ClockFaceId, Theme, WeekDay, StorageKey } from '../constants';
import { BehaviorSubject, Subscription } from 'rxjs';

type ClockFaceCallback = (clockFace: ClockFaceId) => void;
type ThemeCallback = (theme: Theme) => void;
type FullScreenModeCallback = (useFullScreenMode: boolean) => void;
type WeekStartDayCallback = (startDay: WeekDay) => void;

@Injectable()
export class ConfigService {
    public supportFullScreen = false;

    private loadDataPromise

    private firstTimeOpen: boolean;
    public clockFace$ = new BehaviorSubject(ClockFaceId.Heptagon);
    public theme$ = new BehaviorSubject(Theme.Yellow);
    public useFullScreenMode$ = new BehaviorSubject(false);
    public weekStartDay$ = new BehaviorSubject(WeekDay.Monday);

    constructor(
        private storage: Storage,
        androidFullScreen: AndroidFullScreen,
        platform: Platform
    ) {
        const clockFacePromise = platform.ready()
            .then(() => this.storage.get(StorageKey.Setting.ClockFace))
            .then(value => {
                this.clockFace$.next(Number(value));
            })
            .catch(error => {
                this.clockFace$.next(ClockFaceId.Heptagon);
            });

        const themePromise = platform.ready()
            .then(() => this.storage.get(StorageKey.Setting.Theme))
            .then(value => {
                this.theme$.next(Number(value)); // value can be null and Number(null) == 0
            })
            .catch(error => {
                this.theme$.next(Theme.Yellow);
            });

        const fullScreenPromise = platform.ready()
            .then(() => this.storage.get(StorageKey.Setting.UseFullScreen))
            .then(value => {
                this.useFullScreenMode$.next(!!value);
            })
            .catch(error => {
                this.useFullScreenMode$.next(false);
            });

        const weekStartDayPromise = platform.ready()
            .then(() => this.storage.get(StorageKey.Setting.WeekStartDay))
            .then(value => {
                this.weekStartDay$.next(!!value ? value : WeekDay.Monday);
            })
            .catch(error => {
                this.weekStartDay$.next(WeekDay.Monday);
            });

        const supportFullScreenPromise = platform.ready()
            .then(() => {
                androidFullScreen.isImmersiveModeSupported()
                    .then(() => {
                        this.supportFullScreen = true;
                    })
                    .catch(() => {
                        this.supportFullScreen = false;
                });
            });

        const firstTimeOpenPromise = platform.ready()
            .then(() => this.storage.get(StorageKey.Setting.FirstTimeOpen))
            .then(value => {
                this.firstTimeOpen = value === null
                    ? true
                    : value;
            });

        this.loadDataPromise = Promise.all([
            clockFacePromise,
            fullScreenPromise,
            themePromise,
            weekStartDayPromise,
            supportFullScreenPromise,
            firstTimeOpenPromise
        ]);
     }

    appReady(): Promise<void> {
        return this.loadDataPromise;
    }

    // Current clock face
    setClockFace(clockFace: ClockFaceId) {
        this.clockFace$.next(clockFace);
        this.storage.set(StorageKey.Setting.ClockFace, clockFace).catch(() => {});
    }

    getClockFace(): ClockFaceId {
        return this.clockFace$.getValue();
    }

    subscribeCurrentFaceChange(callback: ClockFaceCallback): Subscription {
        return this.clockFace$.subscribe(callback);
    }

    // Full screen mode
    setFullScreenMode(value: boolean): void {
        const useFullScreenMode = this.supportFullScreen && value;
        this.storage.set(StorageKey.Setting.UseFullScreen, useFullScreenMode).catch(() => {});
        this.useFullScreenMode$.next(useFullScreenMode);
    }

    isInFullScreenMode(): boolean {
        return this.supportFullScreen && this.useFullScreenMode$.getValue();
    }

    subscribeFullScreenModeChange(callback: FullScreenModeCallback): Subscription {
        return this.useFullScreenMode$.subscribe((value) => {
            callback(value);
        })
    }

    // Theme
    setTheme(theme: Theme): void {
        this.theme$.next(theme);
        this.storage.set(StorageKey.Setting.Theme, theme).catch(() => {});
    }

    getTheme(): Theme {
        return this.theme$.getValue();
    }

    subscribeThemeChange(callback: ThemeCallback): Subscription {
        return this.theme$.subscribe((value) => {
            callback(value);
        });
    }

    // Week start day
    setWeekStartDay(startDay: WeekDay): void {
        this.weekStartDay$.next(startDay);
        this.storage.set(StorageKey.Setting.WeekStartDay, startDay).catch(() => {});
    }

    getWeekStartDay(): WeekDay {
        return this.weekStartDay$.getValue();
    }

    subscribeWeekStartDayChange(callback: WeekStartDayCallback): Subscription {
        return this.weekStartDay$.subscribe((value) => {
            callback(value);
        });
    }

    setFirstTimeOpen(value: boolean): void {
        this.firstTimeOpen = value;
        this.storage.set(StorageKey.Setting.FirstTimeOpen, value).catch(() => {});
    }

    isFirstTimeOpen(): boolean {
        return this.firstTimeOpen;
    }
}