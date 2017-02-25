import {
    Response,
    Http
} from "@angular/http";
import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import 'rxjs/add/observable/throw';

export abstract class PiholeBackendService {
    protected http: Http;
    constructor(http: Http) {
        this.http = http;
    }

    protected extractData(res: Response) {
        let body = res.json();
        return body.data || {};
    }
    protected handleError(error: Response | any): ErrorObservable<string> {
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || "";
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ""} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        return Observable.throw(errMsg);
    }
}