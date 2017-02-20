import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class PiholeAuthService {
    private loginStateSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);;
    private loggedIn: boolean = false;

    constructor(private http: Http) {
    }

    public get isLoggedIn(): boolean {
        return this.loggedIn;
    }

    private emitta() {
        this.loggedIn = !this.loggedIn;
        this.loginStateSubject.next(this.isLoggedIn);
    }

    public subscribe(updateCallback) {
        return this.loginStateSubject.subscribe(updateCallback);
    }
}