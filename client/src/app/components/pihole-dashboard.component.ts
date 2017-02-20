import { Component } from '@angular/core';
import { PiholeAuthService } from "./../services/pihole-auth.service";
import { Subscription } from 'rxjs/Subscription';

@Component({
    templateUrl: "./pihole-dashboard.component.pug"
})
export class PiholeDashboardComponent {
    private isLoggedIn: boolean;
    private loginSubscription: Subscription;
    constructor(private piholeAuthService: PiholeAuthService) {
        this.isLoggedIn = piholeAuthService.isLoggedIn;
    }

    ngOnInit() {
        this.loginSubscription = this.piholeAuthService.subscribe(
            loggedIn => {
                this.isLoggedIn = loggedIn;
            });
    }

    ngOnDestory() {
        this.loginSubscription.unsubscribe();
    }
}