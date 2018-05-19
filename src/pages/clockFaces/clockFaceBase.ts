import { Input, OnDestroy, AfterViewInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ClockEvent, WeekDay, Theme } from '../../constants';
import { ConfigService } from '../../services/configService';
import {Platform} from 'ionic-angular';

class WeekTime {
    nDay: number;
    nHour: number;
    nMinute: number;
    nSecond: number;
}

export const OPACITY_INCREASEMENT = 0.05;
export const NUM_OPACITY_INCREASE = 1/OPACITY_INCREASEMENT;

export class Edge {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export abstract class ClockFaceBase implements AfterViewInit, OnDestroy {
    @Input() clockEvent$: Subject<ClockEvent>;

    private initialized = false;
    private destroyed = false;
    private paused = false;
    private subscriptions: Subscription;
    private renderInterval: NodeJS.Timer;
    private onResize = () => {
        this.resize();
        this.renderClock(true);
    }

    private onThemeUpdated = (theme: Theme) => {
        if (this.initialized) {
            this.updateTheme(theme);
        }
    }

    private onWeeStartDayUpdated = (startDay: WeekDay) => {
        this.weekStartDay = startDay;
        if (this.initialized) {
            this.updateWeekStartDay(startDay);
        }
    }

    protected weekStartDay: WeekDay;
    protected currentTime: WeekTime;


    constructor(
        protected configService: ConfigService,
        protected platform: Platform,
    ) {}

    ngAfterViewInit(): void {
        this.configService.appReady().then(() => {
            this.onInit();
        });
    }

    ngOnDestroy(): void {
        this.configService.appReady().then(() => {
            this.onDestroy();
        });
    }

    protected updateCurrentTime(allowShift = true): void {
        const weekDayOffset = allowShift
            ? Number(this.weekStartDay) - 1
            : 0;
        const day = new Date();
        let nDay = day.getDay();
        nDay = nDay == 0 ? 7 : nDay;
        nDay = nDay - weekDayOffset;
        nDay = nDay <= 0 ? nDay + 7 : nDay;

        this.currentTime = {
            nDay: nDay,
            nHour: day.getHours(),
            nMinute: day.getMinutes(),
            nSecond: day.getSeconds()
        }
    }

    private onInit(): void {
        this.weekStartDay = this.configService.getWeekStartDay();

        this.initialize();

        this.subscriptions = this.clockEvent$.subscribe(this.handleClockEvent);
        this.subscriptions = this.configService.subscribeThemeChange(this.onThemeUpdated);
        this.subscriptions
            .add(this.configService.subscribeWeekStartDayChange(this.onWeeStartDayUpdated));
        this.subscriptions.add(this.platform.resume.subscribe(() => {
            this.onResume();
        }));
        this.subscriptions.add(this.platform.pause.subscribe(() => {
            this.onPause();
        }));
        window.addEventListener('resize', this.onResize);

        this.setIntervals();

        this.initialized = true;
    }

    private onDestroy(): void {
        this.destroyed = true;

        this.subscriptions.unsubscribe();
        window.removeEventListener('resize', this.onResize);
        this.clearIntervals();

        this.destroy();
    }

    private onResume() {
        // Seems it can still receive some 'resume' event after destroyed
        if (this.initialized && !this.destroyed && this.paused) {
            this.resume();
            this.setIntervals();

            this.paused = false;
        }
    }

    private onPause() {
        if (this.initialized && !this.paused) {
            this.clearIntervals();
            this.pause();

            this.paused = true;
        }
    }

    private render(): void {
        this.renderClock();
    }



    private setIntervals(): void {
        this.renderInterval = this.renderInterval === undefined
            ? setInterval(() => this.render(), 500) // 0.5 sec
            : this.renderInterval;
    }

    private clearIntervals(): void {
        if (this.renderInterval !== undefined) {
            clearInterval(this.renderInterval);
            this.renderInterval = undefined;
        }
    }

    private handleClockEvent = (event: ClockEvent): void => {
        switch(event) {
            case ClockEvent.RESUME:
                this.onResume();
                break;
            case ClockEvent.PAUSE:
                this.onPause();
                break;
            default:
                break;
        }
    }

    protected initialize(): void {};
    protected destroy(): void {};
    protected resume(): void {};
    protected pause(): void {};
    protected resize(): void {};
    protected renderClock(hardRefresh = false): void {};
    protected updateTheme(theme: Theme): void {};
    protected updateWeekStartDay(startDay: WeekDay): void {};

}

export interface IClockFaceProperty {
    SupportTheme: boolean;
    SupportWeekStartDay: boolean;
}