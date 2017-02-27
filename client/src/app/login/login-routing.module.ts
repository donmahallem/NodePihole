import { NgModule } from '@angular/core';
import {
    RouterModule,
    Routes,
    Data
} from '@angular/router';
import { LoginComponent } from './components/login.component';

const settingsRoutes: Routes = [
    {
        path: '',
        component: LoginComponent
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
export class LoginRoutingModule { }