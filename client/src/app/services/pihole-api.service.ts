import { Injectable } from '@angular/core';
import {
    Http,
    Response,
    Headers,
    RequestOptions
} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { PiholeAuthService } from "./pihole-auth.service";
import { PiholeService } from "./pihole.service";

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

@Injectable()
export class PiholeApiService {
    private heroesUrl = 'app/heroes';  // URL to web API
    constructor(private http: Http) {
    }
    public getSummary(): Observable<Summary> {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.get("/api/login",
            options)
            .map(this.extractData)
            .catch(this.handleError);
    }
    public login(password: string): Observable<AuthData> {
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