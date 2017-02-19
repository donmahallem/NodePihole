import { Component } from '@angular/core';
import { DoughnutChartBoxComponent } from "./chartjs/doughnut-chart-box.component"


@Component({
    selector: 'query-types-chart-box',
    template: require("pug-loader!./chartjs/doughnut-chart-box.component.pug")()
})
export class QueryTypesChartBoxComponent extends DoughnutChartBoxComponent {
    ngOnInit() {
        this.chartLabels = ['Download Sales', 'In-Store Sales', 'Mail-Order Sales'];
        this.chartData = [350, 450, 100];
        this.title = "Query Types";
    }
}
