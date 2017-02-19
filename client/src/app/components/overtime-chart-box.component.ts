import { Component } from '@angular/core';
import { LineChartBoxComponent } from "./chartjs/line-chart-box.component"
@Component({
    selector: 'overtime-chart-box',
    template: require("pug-loader!./chartjs/line-chart-box.component.pug")()
})
export class OvertimeChartBoxComponent extends LineChartBoxComponent {
    constructor() {
        super();
    }

    ngOnInit() {
        this.title = "Queries over time";
        this.chartDatasets = [
            {
                data: [65, 59, 80, 81, 56, 55, 40],
                label: 'Total DNS Queries',
                fill: true,
                pointRadius: 1,
                pointHoverRadius: 5,
                pointHitRadius: 5,
                cubicInterpolationMode: "monotone"
            },
            {
                data: [28, 48, 40, 19, 86, 27, 90],
                label: 'Blocked DNS Queries',
                fill: true,
                pointRadius: 1,
                pointHoverRadius: 5,
                pointHitRadius: 5,
                cubicInterpolationMode: "monotone"
            }
        ];
        this.chartLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
        this.chartOptions = {
            responsive: true
        };
        this.chartColors = [
            {
                backgroundColor: "rgba(220,220,220,0.5)",
                borderColor: "rgba(0, 166, 90,.8)",
                pointBorderColor: "rgba(0, 166, 90,.8)",
                pointBackgroundColor: 'rgba(77,83,96,1)',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(77,83,96,1)'
            },
            {
                backgroundColor: "rgba(0,192,239,0.5)",
                borderColor: "rgba(0,192,239,1)",
                pointBorderColor: "rgba(0,192,239,1)",
                pointBackgroundColor: 'rgba(148,159,177,1)',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(148,159,177,0.8)'
            }
        ];
        this.chartLegend = true;
        this.randomize();
    }

    public randomize(): void {
        let _lineChartData: Array<any> = new Array(this.chartDatasets.length);
        for (let i = 0; i < this.chartDatasets.length; i++) {
            _lineChartData[i] = { data: new Array(this.chartDatasets[i].data.length), label: this.chartDatasets[i].label };
            for (let j = 0; j < this.chartDatasets[i].data.length; j++) {
                _lineChartData[i].data[j] = Math.floor((Math.random() * 100) + 1);
            }
        }
        this.chartDatasets = _lineChartData;
    }

}
