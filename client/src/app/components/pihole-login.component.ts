import { Component, Input } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { Router } from '@angular/router';
import { PiholeAuthService } from "./../services/pihole-auth.service";

@Component({
    templateUrl: "./pihole-login.component.pug",
    providers: [Location, { provide: LocationStrategy, useClass: PathLocationStrategy }]
})
export class PiholeLoginComponent {
    @Input("password") password: string;
    protected isRequesting: boolean = false;
    protected wrongPassword: boolean = false;
    constructor(private piholeAuth: PiholeAuthService, private router: Router) {

    }
    protected login() {
        this.isRequesting = true;
        this.piholeAuth
            .login(this.password)
            .subscribe(this.onLoginSuccess.bind(this),
            this.onLoginError.bind(this));
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