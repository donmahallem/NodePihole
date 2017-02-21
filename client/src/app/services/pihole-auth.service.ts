import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { PiholeApiService, AuthData } from "./pihole-api.service";
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class PiholeAuthService {
    private loginStateSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);;
    private loggedIn: boolean = false;
    private authData: AuthData;
    constructor(private piholeApiService: PiholeApiService, private http: Http) {
    }

    public get isLoggedIn(): boolean {
        return this.loggedIn;
    }

    private emitta() {
        this.loggedIn = !this.loggedIn;
        this.loginStateSubject.next(this.isLoggedIn);
    }

    public login(password: string): Observable<AuthData> {
        return this.piholeApiService
            .login(password)
            .map(this.storeAuthInformation);
    }
    private storeAuthInformation(authData: AuthData) {
        this.authData = authData;
        return authData;
    }

    private extractData(res: Response) {
        let body = res.json();
        return body.data || {};
    }

    public subscribe(updateCallback) {
        return this.loginStateSubject.subscribe(updateCallback);
    }
}