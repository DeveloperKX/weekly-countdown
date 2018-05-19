import * as d3 from 'd3';
import { Component } from '@angular/core';
import { ConfigService } from '../../../services/configService';
import { Theme, WeekDay, ClockFaceProperty, ClockFaceId } from '../../../constants';
import { OPACITY_INCREASEMENT, NUM_OPACITY_INCREASE, Edge, ClockFaceBase } from '../clockFaceBase';
import { getBackgroundColor, Position, getPointPositionOnCircle } from '../../../util/util';
import {Platform} from 'ionic-angular';

const RADIUS_OFFSET = 30;
const GROUP_OFFSET_RATE = 0.05 // (1-cos(360/7/2))/2

const PASSED_DAY_COLOR = '#32CD32';
const CURRENT_DAY_COLOR = '#1E90FF'
const LEFT_DAY_COLOR = '#1E90FF';

@Component({
    selector: 'clock-heptagon',
    templateUrl: 'clockHeptagon.html'
})
export class ClockHeptagon extends ClockFaceBase {
    private canvas: any;
    private background: any;

    private width: number;
    private height: number;
    private center: Position;
    private radius: number;
    private edgeWidth: string;
    private fontSize: string;
    private hourPosition: Position;
    private minutePosition: Position;
    private colonPosition: Position;
    private edges: Array<Edge>;

    constructor(
        configService: ConfigService,
        platform: Platform,
    ) {
        super(configService, platform);
    }

    initialize(): void {
        this.canvas = d3.select('svg.heptagonCanvas');
        this.background = d3.select('div.clock-heptagon-content');
        this.updateTheme(this.configService.getTheme());
        this.fadeInClock();
    }

    resume() {
        this.renderClock(true);
    }

    updateTheme(theme: Theme): void {
        if (ClockFaceProperty[String(ClockFaceId.Heptagon)].SupportTheme) {
            this.background.style('background-color', getBackgroundColor(theme));
        }
    }

    updateWeekStartDay(startDay: WeekDay): void {
        this.fadeInClock();
    }

    renderClock(hardRefresh = false): void {
        this.updateCurrentTime(ClockFaceProperty[String(ClockFaceId.Heptagon)].SupportWeekStartDay);

        if (hardRefresh) {
            this.updateData();
            this.updateCanvas();
        }

        if (hardRefresh || (this.currentTime.nMinute === 0 && this.currentTime.nSecond === 0)) {
            this.renderHeptagon();
        }
        if (hardRefresh || this.currentTime.nSecond === 0) {
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

    private updateCanvas(): void {
        this.canvas
            .attr('width', this.width)
            .attr('height', this.height-4); // make svg slightly shorter than the screen, so that it won't scroll a bit
    }

    private renderHeptagon(): void {
        this.canvas.selectAll('g.edge-group').remove()
        const group = this.canvas.append('g')
            .attr("class", "edge-group");

        group.selectAll('line')
            .data(this.edges)
            .enter().append('line')
                .attr("x1", (d) => { return d.x1; })
                .attr("y1", (d) => { return d.y1; })
                .attr("x2", (d) => { return d.x2; })
                .attr("y2", (d) => { return d.y2 })
                .attr("stroke", (d, i) => {
                    if (i+1 < this.currentTime.nDay) {
                        return PASSED_DAY_COLOR;
                    } else if (i+1 == this.currentTime.nDay) {
                        return CURRENT_DAY_COLOR;
                    } else {
                        return LEFT_DAY_COLOR;
                    }
                })
                .attr("stroke-opacity", (d, i) => {
                    if (i+1 == this.currentTime.nDay) {
                        return (24-this.currentTime.nHour)/24;
                    } else {
                        return 1;
                    }
                })
                .attr("stroke-width", this.edgeWidth)
                .attr("stroke-linecap", "round");

        this.groupOffset(group);
    }

    private renderTime(): void {
        this.canvas.selectAll('g.time-group').remove();
        const group = this.canvas.append('g')
            .attr("class", "time-group");

        // draw hour
        group.append('text')
            .attr('x', this.hourPosition.x)
            .attr('y', this.hourPosition.y)
            .attr('font-family', 'sans-serif')
            .attr('font-size', this.fontSize)
            .text(() => {
                const h = 23 - this.currentTime.nHour;
                return h < 10 ? '0' + h : String(h);
            })

        // draw minute
        group.append('text')
            .attr('x', this.minutePosition.x)
            .attr('y', this.minutePosition.y)
            .attr('font-family', 'sans-serif')
            .attr('font-size', this.fontSize)
            .text(() => {
                const m = 59 - this.currentTime.nMinute;
                return m < 10 ? '0' + m : String(m);
            })

        this.groupOffset(group);
   }

    private renderColon(): void {
        this.canvas.selectAll('g.colon-group').remove();
        const group = this.canvas.append('g')
            .attr("class", "colon-group");

        // draw colon
        group.append('text')
            .attr('x', this.colonPosition.x)
            .attr('y', this.colonPosition.y)
            .attr('font-family', 'sans-serif')
            .attr('font-size', this.fontSize)
            .text(() => {
                return ':'
            })
            .attr('opacity', this.currentTime.nSecond % 2 == 0 ? '1.0' : '0.01');

        this.groupOffset(group);
    }

    private groupOffset(group: any): void {
        let groupOffset = this.radius * GROUP_OFFSET_RATE;
        group.attr('transform','translate(0,' + groupOffset +')');
    }

    private updateData(): void {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.center = { x: this.width/2, y: this.height/2 };
        this.radius = (this.width < this.height ? this.width : this.height)/2 - RADIUS_OFFSET;
        this.edges = this.getEdges(this.center, this.radius);

        const length = this.width < this.height ? this.width : this.height;

        let edgeWidth = "12";
        let fontSize = '80px';
        let hourPosition = {
            x: this.width/2-103,
            y: this.height/2+28
        };
        let minutePosition = {
            x: this.width/2+15,
            y: this.height/2+28
        };
        let colonPosition = {
            x: this.width/2-9,
            y: this.height/2+20
        };

        if (length > 700) {
            edgeWidth = "18";
            fontSize = '180px';
            hourPosition = {
                x: this.width/2-228,
                y: this.height/2+57
            }
            minutePosition = {
                x: this.width/2+40,
                y: this.height/2+57
            }
            colonPosition = {
                x: this.width/2-29,
                y: this.height/2+44
            }
        }

        this.edgeWidth = edgeWidth;
        this.fontSize = fontSize;
        this.hourPosition = hourPosition;
        this.minutePosition = minutePosition;
        this.colonPosition = colonPosition;
    }

    private getEdges(center: Position, radius: number): Array<Edge> {
        const theta = [0, 51, 102, 153, 207, 258, 309, 360];
        let points = theta.map((d) => { return getPointPositionOnCircle(center, d, radius) });
        let edges = [];
        for(let i=0; i < points.length-1; i++) {
            edges.push({
                x1: points[i].x,
                y1: points[i].y,
                x2: points[i+1].x,
                y2: points[i+1].y,
            });
        }

        return edges;
    }
}
