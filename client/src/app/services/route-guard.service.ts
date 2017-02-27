import { Injectable } from '@angular/core';
import {
    CanActivate,
    Router,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    CanActivateChild
} from '@angular/router';
import { PiholeAuthService } from "./pihole-auth.service";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/first';

@Injectable()
export class RouteGuardService implements CanActivate, CanActivateChild {
    constructor(private piholeAuth: PiholeAuthService, private router: Router) { }
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
        console.log('AuthGuard#canActivate called', route, state);
        if (!route.data["requiresLogin"]) {
            return true;
        } else {
            return this.piholeAuth.getLoginState()
                .map(authorized => {
                    if (!authorized) {
                        this.router.navigate(["/login"]);
                    }
                    return authorized;
                });
        }
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
        return this.canActivate(route, state);
    }
}