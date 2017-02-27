import { Component, Input } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { Router } from '@angular/router';
import { PiholeAuthService } from "./../../services/pihole-auth.service";
import {
    FormControl,
    FormGroup,
    FormBuilder,
    Validators,
    Validator
} from '@angular/forms';

@Component({
    templateUrl: "./login.component.pug",
    providers: [Location, { provide: LocationStrategy, useClass: PathLocationStrategy }]
})
export class LoginComponent {
    protected isRequesting: boolean = false;
    protected wrongPassword: boolean = false;
    private loginForm: FormGroup;
    constructor(private piholeAuth: PiholeAuthService, private router: Router, private formBuiler: FormBuilder) {
        this.loginForm = new FormGroup({
            password: new FormControl("", Validators.required)
        });
    }
    protected login({ value, valid }: { value: { password: string }, valid: boolean }) {
        console.log(value, valid);
        if (valid) {
            this.isRequesting = true;
            this.piholeAuth
                .login(value.password)
                .subscribe(this.onLoginSuccess.bind(this),
                this.onLoginError.bind(this));
        }
    }

    private onLoginError(error: Error) {
        this.wrongPassword = true;
        this.isRequesting = false;
        console.log("login error", error);
    }

    private onLoginSuccess(data) {
        this.wrongPassword = false;
        this.isRequesting = false;
        this.router.navigate(["/"]);
    }
}