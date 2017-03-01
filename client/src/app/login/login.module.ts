import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginRoutingModule } from "./login-routing.module";
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from "./components/login.component";
import {
    BoxModule
} from "./../modules/adminlte"

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        LoginRoutingModule,
        BoxModule.forRoot()
    ],
    declarations: [
        LoginComponent
    ], exports: [

    ]
})
export class LoginModule { }