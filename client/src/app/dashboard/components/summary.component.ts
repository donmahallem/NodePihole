import { Component } from '@angular/core';
import { PiholeApiService, Summary } from './../../services/pihole-api.service';

@Component({
    selector: '.row[summary]',
    templateUrl: "./summary.component.pug",
    styleUrls: ['./summary.component.css']
})
export class SummaryComponent {
    summary: Summary;
    errorMessage: string;
    constructor(private piholeApi: PiholeApiService) { }
    private getSummary() {
        this.piholeApi.getSummary()
            .subscribe(
            heroes => this.summary = heroes,
            error => console.error(error));
    }
    ngOnInit() {
        this.getSummary();
    }
}
