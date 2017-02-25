import { Injectable } from '@angular/core';
import {
    Http,
    Response,
    Headers,
    RequestOptions,
    Request,
    RequestOptionsArgs
} from "@angular/http";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { PiholeAuthService } from "./pihole-auth.service";
import { PiholeBackendService } from "./pihole-backend.service";

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

@Injectable()
export class PiholeApiService extends PiholeBackendService {
    constructor(private piholeAuth: PiholeAuthService, http: Http) {
        super(http);
    }

    public addDomainToList(list: string, domain: string): Observable<boolean> {
        let headers = new Headers({ "Content-Type": "application/json" });
        let options = new RequestOptions({ headers: headers });
        return this.http
            .get("/api/list", options)
            .map(this.extractData)
            .catch(this.handleError);
    }
    public removeDomainFromList(list: string, domain: string): Observable<boolean> {
        let headers = new Headers({ "Content-Type": "application/json" });
        let options = new RequestOptions({ headers: headers });
        return this.http
            .delete("/api/list", options)
            .map(this.extractData)
            .catch(this.handleError);
    }
    public getOvertimeData(): Observable<OvertimeData> {
        let headers = new Headers({ "Content-Type": "application/json" });
        let options = new RequestOptions({ headers: headers });
        return this.http
            .get("/api/data/overtimeData", options)
            .map(this.extractData)
            .catch(this.handleError);
    }
    public getQueries(): Observable<Query[]> {
        let headers = new Headers({ "Content-Type": "application/json" });
        let options = new RequestOptions({ headers: headers });
        return this.http
            .get("/api/history?type=query", options)
            .map(this.extractData)
            .catch(this.handleError);
    }
    public getList(list: string): Observable<ListEntry[]> {
        let headers = new Headers({ "Content-Type": "application/json" });
        let options = new RequestOptions({ headers: headers });
        return this.http
            .get("/api/list", options)
            .map(this.extractData)
            .catch(this.handleError);
    }
    public getSummary(): Observable<Summary> {
        let headers = new Headers({ "Content-Type": "application/json" });
        let options = new RequestOptions({ headers: headers });
        return this.http
            .get("/api/data/summary", options)
            .map(this.extractData)
            .catch(this.handleError);
    }
    public getStatus(): Observable<Status> {
        let headers = new Headers({ "Content-Type": "application/json" });
        let options = new RequestOptions({ headers: headers });
        return this.http
            .get("/api/status", options)
            .map(this.extractData)
            .catch(this.handleError);
    }

    public postLogin(password: string): Observable<AuthData> {
        let headers = new Headers({ "Content-Type": "application/json" });
        let options = new RequestOptions({ headers: headers });
        return this.http.post("/api/login", { "password": password }, options)
            .map(this.extractData)
            .catch(this.handleError);
    }
    public getLogin(): Observable<AuthData> {
        let headers = new Headers({ "Content-Type": "application/json" });
        let options = new RequestOptions({ headers: headers });
        return this.http.get("/api/login", options)
            .map(this.extractData)
            .catch(this.handleError);
    }

    private request(url: Request | string, requestArgs: RequestOptionsArgs) {
        return this.http.request(url, requestArgs)
            .catch(sourceError => {
                if (sourceError && sourceError.status === 401) {
                    return this.piholeAuth
                        .refreshAuthenticationToken()
                        .flatMap((authResult: AuthData) => {
                            if (authResult) {
                                // retry with new token
                                return this.http.request(url, requestArgs);
                            }
                            return Observable.throw(sourceError);
                        });
                }
                else {
                    return Observable.throw(sourceError);
                }
            });
    }
}