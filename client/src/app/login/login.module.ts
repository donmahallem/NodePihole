import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginRoutingModule } from "./login-routing.module";
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from "./components/login.component";
import { AdminLteBox } from "./../components/adminlte/box.component";

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        LoginRoutingModule
    ],
    declarations: [
        LoginComponent
    ], exports: [

    ]
})
export class LoginModule { }