import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';

import { PiholeDashboardComponent } from './../components/pihole-dashboard.component';
import { PiholeLoginComponent } from './../components/pihole-login.component';
import { SmallboxComponent } from './../components/smallbox.component';
import { DashboardSummaryComponent } from './../components/dashboard-summary.component';
import { OvertimeChartBoxComponent } from './../components/overtime-chart-box.component';
import { QueryTypesChartBoxComponent } from './../components/query-types-chart-box.component';
import { ForwardDestinationsChartBoxComponent } from './../components/forward-destinations-chart-box.component';
import { ChartsModule } from 'ng2-charts';
import { LineChartBoxComponent } from "./../components/chartjs/line-chart-box.component";
import { ChartBoxComponent } from "./../components/chartjs/chart-box.component";
import { DoughnutChartBoxComponent } from "./../components/chartjs/doughnut-chart-box.component";
import { FormsModule } from '@angular/forms';
import { AdminLteBox } from "./../components/adminlte/box.component";
const piholeRoutes: Routes = [
    { path: '', component: PiholeDashboardComponent },
    { path: 'login', component: PiholeLoginComponent }
];

@NgModule({
    declarations: [
        PiholeDashboardComponent,
        PiholeLoginComponent,
        SmallboxComponent,
        DashboardSummaryComponent,
        OvertimeChartBoxComponent,
        QueryTypesChartBoxComponent,
        ForwardDestinationsChartBoxComponent,
        LineChartBoxComponent,
        DoughnutChartBoxComponent,
        AdminLteBox
    ],
    imports: [
        RouterModule.forRoot(piholeRoutes),
        ChartsModule,
        BrowserModule,
        FormsModule
    ],
    exports: [
        RouterModule
    ]
})

export class PiholeRoutingModule { }