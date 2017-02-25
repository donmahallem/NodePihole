import { Component } from '@angular/core';
import { PiholeAuthService } from "./../services/pihole-auth.service";
import { Subscription } from 'rxjs/Subscription';

@Component({
    templateUrl: "./pihole-dashboard.component.pug"
})
export class PiholeDashboardComponent {
    private isLoggedIn: boolean;
    private loginSubscription: Subscription;
    constructor(private piholeAuth: PiholeAuthService) {
        this.isLoggedIn = piholeAuth.isLoggedIn;
    }

    ngOnInit() {
        this.loginSubscription = this.piholeAuth
            .loginState.subscribe(
            loggedIn => {
                this.isLoggedIn = loggedIn;
            });
    }

    ngOnDestory() {
        this.loginSubscription.unsubscribe();
    }
}