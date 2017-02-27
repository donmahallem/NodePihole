import { NgModule } from '@angular/core';
import {
    RouterModule,
    Routes,
    Data
} from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';

import { PiholeDashboardComponent } from './../components/pihole-dashboard.component';
import { PiholeLoginComponent } from './../components/pihole-login.component';
import { PiholeListComponent } from './../components/pihole-list.component';
import { PiholeQueriesComponent } from './../components/pihole-queries.component';
import { SmallboxComponent } from './../components/smallbox.component';
import { DashboardSummaryComponent } from './../components/dashboard-summary.component';
import { OvertimeChartBoxComponent } from './../components/overtime-chart-box.component';
import { QueryTypesChartBoxComponent } from './../components/query-types-chart-box.component';
import { ForwardDestinationsChartBoxComponent } from './../components/forward-destinations-chart-box.component';
import { ChartsModule } from 'ng2-charts';
import { LineChartBoxComponent } from "./../components/chartjs/line-chart-box.component";
import { ChartBoxComponent } from "./../components/chartjs/chart-box.component";
import { DoughnutChartBoxComponent } from "./../components/chartjs/doughnut-chart-box.component";
import {
    AlertModule,
    PaginationModule
} from 'ng2-bootstrap';
import { PiholeQueriesTableComponent } from "./../components/pihole-queries-table.component";
import { RouteGuardService } from "./../services/route-guard.service";


const piholeRoutes: Routes = [
    {
        path: '',
        component: PiholeDashboardComponent,
        data: {
            requiresLogin: false
        }
    },
    {
        path: 'login',
        data: {
            requiresLogin: false
        },
        loadChildren: "app/login/login.module#LoginModule"
    },
    {
        path: 'list',
        component: PiholeListComponent,
        canActivate: [RouteGuardService],
        data: {
            requiresLogin: true
        }
    },
    {
        path: 'queries',
        component: PiholeQueriesComponent,
        canActivate: [RouteGuardService],
        data: {
            requiresLogin: true
        }
    },
    {
        path: 'settings',
        canActivate: [RouteGuardService],
        data: {
            requiresLogin: true
        },
        loadChildren: "app/settings/settings.module#SettingsModule"
    }
];

@NgModule({
    declarations: [
        PiholeDashboardComponent,
        PiholeLoginComponent,
        PiholeQueriesComponent,
        SmallboxComponent,
        DashboardSummaryComponent,
        OvertimeChartBoxComponent,
        QueryTypesChartBoxComponent,
        ForwardDestinationsChartBoxComponent,
        LineChartBoxComponent,
        DoughnutChartBoxComponent,
        PiholeListComponent,
        PiholeQueriesTableComponent
    ],
    imports: [
        RouterModule.forRoot(piholeRoutes),
        AlertModule.forRoot(),
        ChartsModule,
        BrowserModule,
        PaginationModule.forRoot()
    ],
    exports: [
        RouterModule
    ],
    providers: [
        RouteGuardService
    ]
})

export class PiholeRoutingModule { }