import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    SummaryComponent,
    DashboardComponent,
    ForwardDestinationsChartComponent,
    OvertimeChartComponent,
    QueryTypesChartComponent,
    DoughnutChartBoxComponent,
    LineChartBoxComponent
} from "./components"
import { ReactiveFormsModule } from '@angular/forms';
import {
    BoxModule,
    SmallboxModule
} from "./../modules/adminlte"
import { ChartsModule } from 'ng2-charts';

@NgModule({
    imports: [
        CommonModule,
        BoxModule.forRoot(),
        SmallboxModule.forRoot(),
        ChartsModule
    ],
    declarations: [
        SummaryComponent,
        DashboardComponent,
        ForwardDestinationsChartComponent,
        OvertimeChartComponent,
        QueryTypesChartComponent,
        DoughnutChartBoxComponent,
        LineChartBoxComponent
    ], exports: [

    ]
})
export class DashboardModule { }