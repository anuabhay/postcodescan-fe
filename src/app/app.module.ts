import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule } from '@angular/common/http';
import { MapComponent } from './map/map.component';
import { FormsModule } from '@angular/forms';
import { ResultsComponent } from './results/results.component';
import { GridResultsComponent } from './gridresults/gridresults.component';
import { MatTableModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {BusyModule,BusyConfig} from 'angular2-busy';

import { AgGridModule } from 'ag-grid-angular';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    ResultsComponent,
    GridResultsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    MatTableModule,
    BrowserAnimationsModule,
    AgGridModule.withComponents(null),
    BusyModule.forRoot(
          new BusyConfig({
            message: 'Don\'t panic!',
         backdrop: true,
         template: '<div class="loading">{{message}}</div>',
         delay: 200,
         minDuration: 600,
         wrapperClass: 'wrap'
       })
)

],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
