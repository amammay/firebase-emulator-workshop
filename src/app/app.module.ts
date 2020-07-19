import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NbButtonModule, NbCardModule, NbLayoutModule, NbListModule, NbThemeModule} from '@nebular/theme';
import {NbEvaIconsModule} from '@nebular/eva-icons';
import {HttpClientModule} from "@angular/common/http";
import {AngularFireModule} from "@angular/fire";
import {AngularFireAuthModule} from "@angular/fire/auth";
import {AngularFirestoreModule, SETTINGS} from "@angular/fire/firestore";
import {RouterModule} from "@angular/router";
import {environment} from "../environments/environment";
import {AngularFireFunctionsModule} from "@angular/fire/functions";

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireFunctionsModule,
    BrowserAnimationsModule,
    RouterModule.forRoot([]),
    NbThemeModule.forRoot({name: 'cosmic'}),
    NbLayoutModule,
    NbEvaIconsModule,
    NbCardModule,
    NbButtonModule,
    NbListModule,
  ],
  providers: [{
    provide: SETTINGS,
    useValue: environment.emulator ? {
      host: 'localhost:8080',
      ssl: false
    } : undefined
  }],
  bootstrap: [AppComponent]
})
export class AppModule {
}
