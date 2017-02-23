import { Component, Input } from '@angular/core';
import { PiholeService } from "./../services/pihole.service";

@Component({
    templateUrl: "./pihole-login.component.pug"
})
export class PiholeLoginComponent {
    @Input("password") password: string;
    protected isRequesting: boolean = false;
    protected wrongPassword: boolean = false;
    constructor(private piholeService: PiholeService) {

    }
    protected login() {
        this.wrongPassword = !this.wrongPassword;
        this.isRequesting = true;
        this.piholeService
            .auth
            .login(this.password)
            .subscribe(this.onLoginSuccess.bind(this),
            this.onLoginError.bind(this));
    }

    private onLoginError(error: Error) {
        console.log("login error", error);
    }

    private onLoginSuccess(data) {
        console.log("success", data);
    }
}