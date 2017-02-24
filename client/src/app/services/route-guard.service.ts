import { Injectable } from '@angular/core';
import {
    CanActivate,
    Router,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    CanActivateChild
} from '@angular/router';
import { PiholeService } from "./pihole.service";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/first';

@Injectable()
export class RouteGuardService implements CanActivate, CanActivateChild {
    constructor(private piholeService: PiholeService, private router: Router) { }
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
        console.log('AuthGuard#canActivate called', route, state);
        if (!route.data["requiresLogin"]) {
            return true;
        } else {
            this.piholeService
                .auth
                .loginState.first()
                .subscribe(data => {
                    console.log("allowed", data),
                    error => { console.log("not allowed", error) },
                    () => {
                        console.log("complete");
                    }
                });
            return this.piholeService
                .auth
                .loginState.first();
        }
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
        return Observable.of(true).delay(1000);

    }
}