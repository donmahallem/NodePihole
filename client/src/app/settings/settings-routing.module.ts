import { NgModule } from '@angular/core';
import {
    RouterModule,
    Routes,
    Data
} from '@angular/router';
import { SettingsComponent } from './components/settings.component';

const settingsRoutes: Routes = [
    {
        path: '',
        component: SettingsComponent
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(settingsRoutes)
    ],
    exports: [
        RouterModule
    ]
})
export class SettingsRoutingModule { }