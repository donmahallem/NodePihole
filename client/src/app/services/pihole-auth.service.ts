import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class PiholeAuthService {
    private loginStateSubject: BehaviorSubject<boolean>;
    private isLoggedIn: boolean = false;
    constructor(private http: Http) {
        this.loginStateSubject = new BehaviorSubject<boolean>(false);
        //setInterval(this.emitta.bind(this),2000);
    }
    private emitta() {
        this.isLoggedIn = !this.isLoggedIn;
        this.loginStateSubject.next(this.isLoggedIn);
    }
    public subscribe(a, b, c) {
        return this.loginStateSubject.subscribe(a, b, c);
    }
}