import { Component } from '@angular/core';
import { DoughnutChartBoxComponent } from "./doughnut-chart-box.component"


@Component({
    selector: 'forward-destinations-chart-box',
    templateUrl: "./doughnut-chart-box.component.pug"
})
export class ForwardDestinationsChartComponent extends DoughnutChartBoxComponent {

    constructor() {
        super();
        this.title = "Forward Destinations";
    }

    ngOnInit() {
        this.chartLabels = ['Download Sales', 'In-Store Sales', 'Mail-Order Sales'];
        this.chartData = [350, 450, 100];
    }
}
