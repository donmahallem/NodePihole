import { NgModule } from '@angular/core';
import {
    RouterModule,
    Routes,
    Data
} from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';

import { PiholeLoginComponent } from './../components/pihole-login.component';
import { PiholeListComponent } from './../components/pihole-list.component';
import {
    AlertModule,
    PaginationModule
} from 'ng2-bootstrap';
import { RouteGuardService } from "./../services/route-guard.service";
import { DashboardComponent } from './../dashboard';


const piholeRoutes: Routes = [
    {
        path: '',
        component: DashboardComponent,
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
        canActivate: [RouteGuardService],
        data: {
            requiresLogin: true
        },
        loadChildren: "app/history/history.module#HistoryModule"
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
        PiholeLoginComponent,
        PiholeListComponent
    ],
    imports: [
        RouterModule.forRoot(piholeRoutes),
        AlertModule.forRoot(),
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