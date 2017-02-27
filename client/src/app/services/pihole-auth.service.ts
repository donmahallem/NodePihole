import { Injectable } from '@angular/core';
import {
    Http,
    Response,
    Headers,
    RequestOptions,
    Request,
    RequestMethod
} from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { PiholeBackendService } from "./pihole-backend.service";
export class AuthData {
    access_token: string;
    refresh_token: string;
    csrf_token: string;
}


@Injectable()
export class PiholeAuthService extends PiholeBackendService {
    private readonly MINUTE: number = 60000;
    private loginStateSubject: BehaviorSubject<boolean>;
    public readonly loginState: Observable<boolean>;
    private loggedIn: boolean = false;
    private authData: AuthData;
    private refreshInterval: number;
    private lastCheckedTimestamp: number = 0;

    constructor(http: Http) {
        super(http);
        this.loginStateSubject = new BehaviorSubject<boolean>(false);
        this.loginState = this.loginStateSubject.asObservable();
        this.checkAccessToken()
            .subscribe(state => {
                console.log("Initial login state", state);
            });
    }


    public refreshAuthenticationToken(): Observable<AuthData> {
        let headers = new Headers({ "Content-Type": "application/json" });
        let options = new RequestOptions({ headers: headers });
        return this.http.get("/api/login", options)
            .map(this.extractData)
            .catch(this.handleError);
    }

    public getLoginState(): Observable<boolean> {
        let currentTimestamp: number = Date.now();
        if (this.lastCheckedTimestamp + this.MINUTE > currentTimestamp && this.isLoggedIn) {
            return Observable.of(true);
        } else {
            return this
                .checkAccessToken();
        }
    }

    private getAccessToken(): Observable<AuthData> {
        let headers = new Headers({ "Content-Type": "application/json" });
        let options = new RequestOptions({
            method: RequestMethod.Post,
            headers: headers
        });
        return this.request("/api/auth/introspect", options)
            .map(this.storeAuthInformation.bind(this))
    }

    private checkAccessToken(): Observable<boolean> {
        return this.getAccessToken()
            .map(authData => {
                return true;
            }).catch(error => {
                return Observable.of(false);
            });
    }

    public get isLoggedIn(): boolean {
        return this.loggedIn;
    }

    public login(password: string): Observable<AuthData> {
        let headers = new Headers({ "Content-Type": "application/json" });
        let options = new RequestOptions({
            method: RequestMethod.Post,
            headers: headers,
            body: { "password": password }
        });
        return this.request("/api/auth/login", options)
            .map(this.storeAuthInformation.bind(this));
    }
    private request(url: Request | string, requestOptions: RequestOptions): Observable<any> {
        requestOptions.headers["Content-Type"] = "application/json";
        return this.http.request(url, requestOptions)
            .map(this.extractData)
            .catch(this.handleError);
    }
    private storeAuthInformation(authData: AuthData) {
        this.authData = authData;
        this.loggedIn = true;
        this.loginStateSubject.next(this.loggedIn);
        this.lastCheckedTimestamp = Date.now();
        return authData;
    }
}