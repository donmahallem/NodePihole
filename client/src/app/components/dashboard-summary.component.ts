import { Component } from '@angular/core';
import { PiholeApiService, Summary } from './../services/pihole-api.service';

@Component({
    selector: '.row[dashboard-summary]',
    templateUrl: "./dashboard-summary.component.pug",
    styleUrls: ['./dashboard-summary.component.css']
})
export class DashboardSummaryComponent {
    summary: Summary;
    errorMessage: string;
    constructor(private piholeApi: PiholeApiService) { }
    private getSummary() {
        this.piholeApi.getHeroes()
            .subscribe(
            heroes => this.summary = heroes,
            error => console.error(error));
    }
    ngOnInit() {
        this.getSummary();
    }
}
