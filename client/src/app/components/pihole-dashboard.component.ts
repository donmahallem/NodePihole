import { Component } from '@angular/core';
import { PiholeService } from "./../services/pihole.service";
import { Subscription } from 'rxjs/Subscription';

@Component({
    templateUrl: "./pihole-dashboard.component.pug"
})
export class PiholeDashboardComponent {
    private isLoggedIn: boolean;
    private loginSubscription: Subscription;
    constructor(private piholeService: PiholeService) {
        this.isLoggedIn = piholeService.isLoggedIn;
    }

    ngOnInit() {
        this.loginSubscription = this.piholeService.subscribe(
            loggedIn => {
                this.isLoggedIn = loggedIn;
            });
    }

    ngOnDestory() {
        this.loginSubscription.unsubscribe();
    }
}