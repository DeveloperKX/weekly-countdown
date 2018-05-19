import * as d3 from 'd3';
import { Component } from '@angular/core';
import { ConfigService } from '../../../services/configService';
import {OPACITY_INCREASEMENT, NUM_OPACITY_INCREASE, ClockFaceBase } from '../clockFaceBase';
import { Position, getBackgroundColor } from '../../../util/util';
import {Platform} from 'ionic-angular';
import { ClockFaceProperty, Theme, WeekDay, ClockFaceId } from '../../../constants';

const MARGIN_SCREEN = 8;
const MARGIN_RECTANGLE = 4;

class Rectangle {
    x: number;
    y: number;
    rx: number;
    ry: number;
    width: number;
    height: number;
    color: string;
}

@Component({
    selector: 'clock-rainbow',
    templateUrl: 'clockRainbow.html'
})
export class ClockRainbow extends ClockFaceBase {
    private canvas: any;
    private background: any;

    private width: number;
    private height: number;
    private backgroundColor: string;
    private rectangles: Array<Rectangle>;
    private ellipseWidth: number;
    private ellipseHeight: number;
    private fontSize: string;
    private hourPosition: Position;
    private minutePosition: Position;
    private colonPosition: Position;

    constructor(
        configService: ConfigService,
        platform: Platform,
    ) {
        super(configService, platform);
    }

    initialize(): void {
        this.canvas = d3.select('svg.rainbowCanvas');
        this.background = d3.select('div.clock-rainbow-content');
        this.updateTheme(this.configService.getTheme());
    }

    resume(): void {
        this.renderClock(true);
    }

    updateTheme(theme: Theme): void {
        if (ClockFaceProperty[String(ClockFaceId.Rainbow)].SupportTheme) {
            this.backgroundColor = getBackgroundColor(theme);
        } else {
            this.backgroundColor = getBackgroundColor(Theme.Beige);
        }
        this.fadeInClock();
    }

    updateWeekStartDay(startDay: WeekDay): void {
        this.fadeInClock();
    }

    renderClock(hardRefresh = false): void {
        this.updateCurrentTime(ClockFaceProperty[String(ClockFaceId.Rainbow)].SupportWeekStartDay);

        if (hardRefresh) {
            this.updateStaticData();
            this.updateCanvas();
        }

        if (hardRefresh || (this.currentTime.nHour === 0 && this.currentTime.nMinute === 0 && this.currentTime.nSecond == 0)) {
            this.renderRectangles();
            this.renderTimeBackgroundEllipse();
            this.renderCurrentDayMark();
        }

        if (hardRefresh || (this.currentTime.nSecond === 0)) {
            this.renderTime();
        }

        this.renderColon();
    }

    private fadeInClock(): void {
        let i = 0
        let opacity = 0.0;
        let itv = setInterval(() => {
            this.background.style('opacity', opacity);
            if (opacity < 0.1) {
                this.renderClock(true);
            }
            i++;
            opacity = opacity + OPACITY_INCREASEMENT
            if (i >= NUM_OPACITY_INCREASE) {
                clearInterval(itv);
            }
        }, 100);
    }

    private updateStaticData(): void {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.rectangles = this.getRectangles();

        if (this.width < this.height) {
            this.fontSize = '90px';
            this.ellipseWidth = 135;
            this.ellipseHeight = 80;
            this.hourPosition = {
                x: this.width/2-115,
                y: this.height/2+32
            };

            this.minutePosition = {
                x: this.width/2+18,
                y: this.height/2+32
            };

            this.colonPosition = {
                x: this.width/2-16,
                y: this.height/2+23
            };
        } else {
            this.fontSize = '120px';
            this.ellipseWidth = 200;
            this.ellipseHeight = 100
            this.hourPosition = {
                x: this.width/2-160,
                y: this.height/2+40
            };

            this.minutePosition = {
                x: this.width/2+36,
                y: this.height/2+40
            };

            this.colonPosition = {
                x: this.width/2-16,
                y: this.height/2+34
            };
        }
    }

    private updateCanvas(): void {
        this.canvas
            .attr('width', this.width)
            .attr('height',this.height-4); // make svg slightly shorter than the screen, so that it won't scroll a bit
        this.background.style('background-color', this.backgroundColor);
    }

    private renderRectangles(): void {
        this.canvas.selectAll('g.rect-group').remove();
        const group = this.canvas.append('g')
            .attr('class', 'rect-group');

        group.selectAll('rect')
            .data(this.rectangles)
            .enter().append('rect')
                .attr('x', (d) => { return d.x })
                .attr('y', (d) => { return d.y })
                .attr('rx', (d) => { return d.rx })
                .attr('ry', (d) => { return d.ry })
                .attr('width', (d) => { return d.width })
                .attr('height', (d) => { return d.height })
                .attr('fill', (d) => { return d.color });

   }

    private renderTimeBackgroundEllipse(): void {
        this.canvas.selectAll('g.ellipse-group').remove()
        const group = this.canvas.append('g')
            .attr('class', 'ellipse-group');

        group.append('ellipse')
            .attr('cx', this.width/2)
            .attr('cy', this.height/2)
            .attr('rx', this.ellipseWidth)
            .attr('ry', this.ellipseHeight)
            .attr('fill', '#FFFFF0')
            .attr('opacity', 0.8)
    }

    private renderCurrentDayMark(): void {
        const rect = this.rectangles[this.currentTime.nDay-1];
        const N = 720;

        const colorScale = d3.scaleSequential(d3.interpolateRainbow)
            .domain([0, 2*Math.PI]);

        const offset = {
            x: 0,
            y: 0
        }
        let innerRadius = 0, outerRadius = 0;
        if (this.width < this.height) {
            innerRadius = 7;
            outerRadius = 10;
            offset.x = rect.x+outerRadius+9;
            offset.y = rect.y+rect.height/2;
        } else {
            innerRadius = 12;
            outerRadius = 15;
            offset.x = rect.x+rect.width/2;
            offset.y = rect.y+outerRadius+12;
        }

        this.canvas.selectAll('g.mark-group').remove();
        const group = this.canvas.append('g')
            .attr('class', 'mark-group')
            .attr('transform', `translate(${offset.x}, ${offset.y})`);

        group.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', outerRadius+1)
            .attr('fill', d => this.backgroundColor);

        group.selectAll('path')
            .data(d3.range(0, 2*Math.PI, 2*Math.PI/N))
            .enter()
            .append('path')
            .attr('d', d => d3.arc()({
                innerRadius: innerRadius,
                outerRadius: outerRadius,
                startAngle: d,
                endAngle: d + 2*Math.PI/N * 1.1
            }))
            .attr('fill', d => { return colorScale(d); });
    }

    private renderTime(): void {
        this.canvas.selectAll('g.time-group').remove();
        const group = this.canvas.append('g')
            .attr('class', 'time-group');

        // draw hour
        group.append('text')
            .attr('x', this.hourPosition.x)
            .attr('y', this.hourPosition.y)
            .attr('font-family', 'sans-serif')
            .attr('font-size', this.fontSize)
            .text(() => {
                const h = 23 - this.currentTime.nHour;
                return h < 10 ? '0' + h : String(h);
            });

        // draw minute
        group.append('text')
            .attr('x', this.minutePosition.x)
            .attr('y', this.minutePosition.y)
            .attr('font-family', 'sans-serif')
            .attr('font-size', this.fontSize)
            .text(() => {
                const m = 59 - this.currentTime.nMinute;
                return m < 10 ? '0' + m : String(m);
            });
    }

    private renderColon(): void {
        this.canvas.selectAll('g.colon-group').remove();
        const group = this.canvas.append('g')
            .attr('class', 'colon-group');

        group.append('text')
            .attr('x', this.colonPosition.x)
            .attr('y', this.colonPosition.y)
            .attr('font-family', 'sans-serif')
            .attr('font-size', this.fontSize)
            .text(() => ':')
            .attr('opacity', this.currentTime.nSecond % 2 === 0 ? '1.0' : '0.01');
    }

    private getRectangles(): Array<Rectangle> {
        // Red Orange Yellow Green Blue Indigo Violet
        const colors = ['#FF4500', '#FF8C00', '#FFD700', '#32CD32', '#00BFFF', '#9932CC', '#DA70D6'];
        let rects = [];
        if (this.width > this.height) {
            const width = (this.width - 2 * MARGIN_SCREEN - 6 * MARGIN_RECTANGLE) / 7;
            const height = this.height - 2 * MARGIN_SCREEN;

            for(let i = 0; i < 7; i++) {
                rects.push({
                    x: MARGIN_SCREEN + i * (width + MARGIN_RECTANGLE),
                    y: MARGIN_SCREEN,
                    rx: 7,
                    ry: 7,
                    width: width,
                    height: height,
                    color: colors[i],
                });
            }
        } else {
            const width = this.width - 2 * MARGIN_SCREEN;
            const height = (this.height - 2 * MARGIN_SCREEN - 6 * MARGIN_RECTANGLE) / 7;

            for(let i = 0; i < 7; i++) {
                rects.push({
                    x: MARGIN_SCREEN,
                    y: MARGIN_SCREEN + i * (height + MARGIN_RECTANGLE),
                    rx: 7,
                    ry: 7,
                    width: width,
                    height: height,
                    color: colors[i],
                });
            }
        }

        return rects;
    }
}
