import { Theme } from '../constants';

export class Position {
    x: number;
    y: number;
}

export function getBackgroundColor(theme: Theme) {
    switch(theme) {
        case Theme.White:
            return 'white';
        case Theme.Beige:
            return '#F5F5DC'
        default:
            return '#FFC90E';
    }
}

export function getPointPositionOnCircle(center: Position, theta: number, radius: number): Position {
    return {
        x: center.x + radius * Math.sin(theta * Math.PI / 180),
        y: center.y - radius * Math.cos(theta * Math.PI / 180),
    };
}
