import { Component } from '@angular/core';
import { DoughnutChartBoxComponent } from "./doughnut-chart-box.component"


@Component({
    selector: 'query-types-chart-box',
    templateUrl: "./doughnut-chart-box.component.pug"
})
export class QueryTypesChartComponent extends DoughnutChartBoxComponent {
    ngOnInit() {
        this.chartLabels = ['Download Sales', 'In-Store Sales', 'Mail-Order Sales'];
        this.chartData = [350, 450, 100];
        this.title = "Query Types";
    }
}
