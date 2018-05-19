import { Component } from '@angular/core';
import { ConfigService } from '../../../services/configService';
import { ClockFaceBase } from '../clockFaceBase';
import {Platform} from 'ionic-angular';
import { ClockFaceProperty, Theme, WeekDay, ClockFaceId } from '../../../constants';
import { getBackgroundColor } from '../../../util/util';

@Component({
    selector: 'clock-text',
    templateUrl: 'clockText.html'
})
export class ClockText extends ClockFaceBase {
    private canvasElement: HTMLElement;
    private dayTimeElement: HTMLElement;
    private hourTimeElement: HTMLElement;
    private minuteTimeElement: HTMLElement;
    private secondTimeElement: HTMLElement;

    constructor(
        configService: ConfigService,
        platform: Platform,
    ) {
        super(configService, platform);
    }

    initialize(): void {
        this.canvasElement = document.getElementById('clock-text-content');
        this.dayTimeElement = document.getElementById('clock-text-day-time');
        this.hourTimeElement = document.getElementById('clock-text-hour-time');
        this.minuteTimeElement = document.getElementById('clock-text-minute-time');
        this.secondTimeElement = document.getElementById('clock-text-second-time');

        this.updateTheme(this.configService.getTheme());
    }

    resume(): void {
        this.renderClock();
    }

    updateTheme(theme: Theme): void {
        if (ClockFaceProperty[String(ClockFaceId.Text)].SupportTheme) {
            this.canvasElement.style.backgroundColor = getBackgroundColor(theme);
        }
    }

    updateWeekStartDay(startDay: WeekDay): void {
        this.renderClock();
    }

    renderClock(hardRefresh = false): void {
        this.updateCurrentTime(ClockFaceProperty[String(ClockFaceId.Text)].SupportWeekStartDay);

        const d = '0' + String(7 - this.currentTime.nDay);
        let h = String(23 - this.currentTime.nHour);
        let m = String(59 - this.currentTime.nMinute);
        let s = String(59 - this.currentTime.nSecond);

        h = h.length < 2 ? '0' + h : h;
        m = m.length < 2 ? '0' + m : m;
        s = s.length < 2 ? '0' + s : s;

        this.dayTimeElement.innerHTML=`${d}`;
        this.hourTimeElement.innerHTML=`${h}`;
        this.minuteTimeElement.innerHTML=`${m}`;
        this.secondTimeElement.innerHTML=`${s}`;
    }
}
