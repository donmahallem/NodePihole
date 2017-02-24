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

export class OvertimeData {
    ads: Map<Number, Number>;
    queries: Map<Number, Number>;
}
export class Query {
    domain: string;
    timestamp: string;
}
export class Status {
    temperature: number | boolean;
    status: boolean;
    memory: number;
    loadAverage: number;
}
export class ListEntry {
    domain: string;
    type: number;
}

class PiholeAuth {

    private loginStateSubject: BehaviorSubject<boolean>;
    public readonly loginState: Observable<boolean>;
    private loggedIn: boolean = false;
    private authData: AuthData;

    constructor(private piholeService: PiholeService) {
        this.loginStateSubject = new BehaviorSubject<boolean>(false);
        this.loginState = this.loginStateSubject.asObservable();
    }

    public get isLoggedIn(): boolean {
        return this.loggedIn;
    }

    public login(password: string): Observable<AuthData> {
        return this.piholeService
            .api
            .postLogin(password)
            .map(this.storeAuthInformation.bind(this));
    }
    private storeAuthInformation(authData: AuthData) {
        this.authData = authData;
        this.loggedIn = true;
        this.loginStateSubject.next(this.loggedIn);
        return authData;
    }
}

class PiholeApi {
    private piholeService: PiholeService;
    constructor(piholeService: PiholeService) {
        this.piholeService = piholeService;
    }

    public addDomainToList(list: string, domain: string): Observable<boolean> {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.piholeService
            .http
            .get("/api/list", options)
            .map(this.extractData)
            .catch(this.handleError);
    }
    public removeDomainFromList(list: string, domain: string): Observable<boolean> {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.piholeService
            .http
            .delete("/api/list", options)
            .map(this.extractData)
            .catch(this.handleError);
    }
    public getOvertimeData(): Observable<OvertimeData> {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.piholeService
            .http
            .get("/api/data/overtimeData", options)
            .map(this.extractData)
            .catch(this.handleError);
    }
    public getQueries(): Observable<Query[]> {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.piholeService
            .http
            .get("/api/history?type=query", options)
            .map(this.extractData)
            .catch(this.handleError);
    }
    public getList(list: string): Observable<ListEntry[]> {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.piholeService
            .http
            .get("/api/list", options)
            .map(this.extractData)
            .catch(this.handleError);
    }
    public getSummary(): Observable<Summary> {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.piholeService
            .http
            .get("/api/summary", options)
            .map(this.extractData)
            .catch(this.handleError);
    }
    public getStatus(): Observable<Status> {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.piholeService
            .http
            .get("/api/status", options)
            .map(this.extractData)
            .catch(this.handleError);
    }

    public postLogin(password: string): Observable<AuthData> {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.piholeService
            .http.post("/api/login", { "password": password }, options)
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
        return Observable.throw(errMsg);
    }
}

@Injectable()
export class PiholeService {
    private heroesUrl = 'app/heroes';  // URL to web API
    public readonly api: PiholeApi;
    public readonly auth: PiholeAuth;
    public readonly http: Http;
    constructor(http: Http) {
        this.http = http;
        this.api = new PiholeApi(this);
        this.auth = new PiholeAuth(this);
    }
}