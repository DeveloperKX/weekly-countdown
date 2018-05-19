import { AndroidFullScreen } from '@ionic-native/android-full-screen';
import { BrowserModule } from '@angular/platform-browser';
import { ConfigService } from '../services/configService';
import { ErrorHandler, NgModule } from '@angular/core';
import { ClockContainerPage } from '../pages/clockContianer/clockContainer';
import { ClockHeptagon } from '../pages/clockFaces/clockHeptagon/clockHeptagon';
import { ClockText } from '../pages/clockFaces/clockText/clockText';
import { ClockRainbow } from '../pages/clockFaces/clockRainbow/clockRainbow';
import { Insomnia } from '@ionic-native/insomnia';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { MyApp } from './app.component';
import { SettingsPage } from '../pages/settings/settings';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

@NgModule({
    declarations: [
        MyApp,
        ClockContainerPage,
        ClockHeptagon,
        ClockText,
        ClockRainbow,
        SettingsPage,
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(MyApp),
        IonicStorageModule.forRoot({
            name: '__settings',
            driverOrder: ['indexeddb', 'sqlite', 'websql']
        })
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        ClockContainerPage,
        ClockHeptagon,
        ClockText,
        ClockRainbow,
        SettingsPage
    ],
    providers: [
        StatusBar,
        SplashScreen,
        Insomnia,
        AndroidFullScreen,
        ConfigService,
        {provide: ErrorHandler, useClass: IonicErrorHandler}
    ]
})
export class AppModule {}
