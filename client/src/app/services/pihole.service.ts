import { Injectable } from '@angular/core';
import {
    Http,
    Response,
    Headers,
    RequestOptions
} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { PiholeAuthService } from "./pihole-auth.service";
import { PiholeApiService } from "./pihole-api.service";
import { Subscription } from 'rxjs/Subscription';

export class Summary {
    adsBlockedToday: number;
    dnsQueriesToday: number;
    domainsBeingBlocked: number;
}

export class AuthData {
    access_token: string;
    refresh_token: string;
    csrf_token: string;
}


class PiholeAuth {

    private loginStateSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);;
    private loggedIn: boolean = false;
    private authData: AuthData;

    constructor(private piholeService: PiholeService) {
    }

    public get isLoggedIn(): boolean {
        return this.loggedIn;
    }

    private emitta() {
        this.loggedIn = !this.loggedIn;
        this.loginStateSubject.next(this.isLoggedIn);
    }

    public login(password: string): Observable<AuthData> {
        return this.piholeService
            .api
            .postLogin(password)
            .map(this.storeAuthInformation);
    }
    private storeAuthInformation(authData: AuthData) {
        this.authData = authData;
        return authData;
    }

    public subscribe(updateCallback): Subscription {
        return this.loginStateSubject.subscribe(updateCallback);
    }
}


class PiholeApi {

    constructor(private piholeService: PiholeService, private http: Http) {

    }
    public getSummary(): Observable<Summary> {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.get("/api/summary",
            options)
            .map(this.extractData)
            .catch(this.handleError);
    }

    public postLogin(password: string): Observable<AuthData> {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post("/api/login",
            { "password": password },
            options)
            .map(this.extractData)
            .catch(this.handleError);
    }
    private extractData(res: Response) {
        let body = res.json();
        return body.data || {};
    }
    private handleError(error: Response | any) {
        // In a real world app, we might use a remote logging infrastructure
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Observable.throw(errMsg);
    }
}

@Injectable()
export class PiholeService {
    private heroesUrl = 'app/heroes';  // URL to web API
    public readonly api: PiholeApi;
    public readonly auth: PiholeAuth;
    private readonly http: Http;
    constructor(http: Http) {
        this.http = http;
        this.api = new PiholeApi(this, this.http);
        this.auth = new PiholeAuth(this);
    }
}