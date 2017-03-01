import { Component } from '@angular/core';
import { AbstractChartBoxComponent } from "./abstract-chart-box.component";
@Component({
    selector: 'line-chart-box',
    templateUrl: "./line-chart-box.component.pug"
})
export class LineChartBoxComponent extends AbstractChartBoxComponent {
    // lineChart
    protected chartDatasets: Array<any>;
    protected chartLegend: boolean = true;
    constructor() {
        super("line");
    }
}
