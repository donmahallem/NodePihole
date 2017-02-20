import { Component } from '@angular/core';
import { ChartBoxComponent } from "./chart-box.component";
@Component({
    selector: 'line-chart-box',
    templateUrl: "./line-chart-box.component.pug"
})
export class LineChartBoxComponent extends ChartBoxComponent {
    // lineChart
    protected chartDatasets: Array<any>;
    protected chartLegend: boolean = true;
    constructor() {
        super("line");
    }
}
