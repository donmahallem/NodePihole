import { Component } from '@angular/core';
import { PiholeService, Summary } from './../services/pihole.service';

@Component({
    selector: '.row[dashboard-summary]',
    templateUrl: "./dashboard-summary.component.pug",
    styleUrls: ['./dashboard-summary.component.css']
})
export class DashboardSummaryComponent {
    summary: Summary;
    errorMessage: string;
    constructor(private piholeService: PiholeService) { }
    private getSummary() {
        this.piholeService.api.getSummary()
            .subscribe(
            heroes => this.summary = heroes,
            error => console.error(error));
    }
    ngOnInit() {
        this.getSummary();
    }
}
