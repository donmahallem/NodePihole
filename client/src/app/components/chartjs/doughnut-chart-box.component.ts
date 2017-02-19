import { Component } from '@angular/core';
import { ChartBoxComponent } from "./chart-box.component";
@Component({
    selector: 'doughnut-graph-box',
    template: require("pug-loader!./doughnut-chart-box.component.pug")()
})
export class DoughnutChartBoxComponent extends ChartBoxComponent {
    protected chartData: number[];
    constructor() {
        super("doughnut");
        this.chartColors = [{
            backgroundColor: ChartBoxComponent.DEFAULT_COLORS
        }
        ];
    }
}
