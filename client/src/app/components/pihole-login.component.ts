import { Component, Input } from '@angular/core';
import { PiholeAuthService } from "./../services/pihole-auth.service";

@Component({
    templateUrl: "./pihole-login.component.pug"
})
export class PiholeLoginComponent {
    @Input("password") password: string;
    protected isRequesting: boolean = false;
    protected wrongPassword: boolean = false;
    constructor(private authService: PiholeAuthService) {

    }
    protected login() {
        this.wrongPassword = !this.wrongPassword;
        this.isRequesting = true;
        this.authService.login(this.password);
    }
}