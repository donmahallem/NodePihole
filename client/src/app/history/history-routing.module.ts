import { NgModule } from '@angular/core';
import {
    RouterModule,
    Routes,
    Data
} from '@angular/router';
import { HistoryComponent } from './components';

const historyRoutes: Routes = [
    {
        path: '',
        component: HistoryComponent
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(historyRoutes)
    ],
    exports: [
        RouterModule
    ]
})
export class HistoryRoutingModule { }