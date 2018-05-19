import { IClockFaceProperty } from './pages/clockFaces/clockFaceBase';

export enum ClockFaceId {
    Rainbow = 0, // 0 is default clock face
    Text,
    Heptagon,
}

export enum Theme {
    Beige = 0,
    Yellow,
    White,
}

export enum WeekDay {
    Monday = 1,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
    Sunday
}

export const TIPS = "Tips: tap clock face several times to go to settings";

export class StorageKey {
    static Setting = {
        UseFullScreen: 'sk_usefullscreen',
        Theme: 'sk_theme',
        WeekStartDay: 'sk_weekstartday',
        ClockFace: 'sk_clockface',
        FirstTimeOpen: 'sk_firsttimeopen',
    }
}

// Index must be consist with the value of enum ClockFace
export const ClockFaceProperty: {[clockFace: string]: IClockFaceProperty} = {
    // Rainbow
    [String(ClockFaceId.Rainbow)] : <IClockFaceProperty> {
        SupportTheme: true,
        SupportWeekStartDay: true,
    },

    // Text
    [String(ClockFaceId.Text)] : <IClockFaceProperty> {
        SupportTheme: true,
        SupportWeekStartDay: true,
    },

    // Heptagon
    [String(ClockFaceId.Heptagon)] : <IClockFaceProperty> {
        SupportTheme: true,
        SupportWeekStartDay: true,
    },
}

export enum ClockEvent {
    RESUME,
    PAUSE,
}
