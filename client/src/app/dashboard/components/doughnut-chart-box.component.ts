import { Component } from '@angular/core';
import { AbstractChartBoxComponent } from "./abstract-chart-box.component";

@Component({
    selector: 'doughnut-chart-box',
    templateUrl: "./doughnut-chart-box.component.pug"
})
export class DoughnutChartBoxComponent extends AbstractChartBoxComponent {
    protected chartData: number[];
    constructor() {
        super("doughnut");
        this.chartColors = [{
            backgroundColor: AbstractChartBoxComponent.DEFAULT_COLORS
        }
        ];
    }
}
