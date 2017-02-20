import { Component, Input } from '@angular/core';


@Component({
    templateUrl: "./pihole-login.component.pug"
})
export class PiholeLoginComponent {
    @Input("password") password: string;
    protected isRequesting: boolean = false;
    protected wrongPassword: boolean = false;

    protected login() {
        console.log(this.password);
        this.wrongPassword = !this.wrongPassword;
    }
}