import { Component } from '@angular/core';
import { LineChartBoxComponent } from "./line-chart-box.component"
import { PiholeApiService, OvertimeData } from "./../../services/pihole-api.service";
const padNumber = function (num) {
    return ("00" + num)
        .substr(-2, 2);
};
@Component({
    selector: 'overtime-chart-box',
    templateUrl: "./line-chart-box.component.pug"
})
export class OvertimeChartComponent extends LineChartBoxComponent {
    constructor(private piholeApi: PiholeApiService) {
        super();
    }

    ngOnInit() {
        this.title = "Queries over time";
        this.chartDatasets = [
            {
                data: [],
                label: 'Total DNS Queries',
                fill: true,
                pointRadius: 1,
                pointHoverRadius: 5,
                pointHitRadius: 5,
                cubicInterpolationMode: "monotone"
            },
            {
                data: [],
                label: 'Blocked DNS Queries',
                fill: true,
                pointRadius: 1,
                pointHoverRadius: 5,
                pointHitRadius: 5,
                cubicInterpolationMode: "monotone"
            }
        ];
        this.chartLabels = [];
        this.chartOptions = {
            responsive: true,
            tooltips: {
                enabled: true,
                mode: "x-axis",
                callbacks: {
                    title: function (tooltipItem, data) {
                        var label = tooltipItem[0].xLabel;
                        var time = label.match(/(\d?\d):?(\d?\d?)/);
                        var h = parseInt(time[1], 10);
                        var m = parseInt(time[2], 10) || 0;
                        var from = padNumber(h) + ":" + padNumber(m) + ":00";
                        var to = padNumber(h) + ":" + padNumber(m + 9) + ":59";
                        return "Queries from " + from + " to " + to;
                    },
                    label: function (tooltipItems, data) {
                        if (tooltipItems.datasetIndex === 1) {
                            var percentage = 0.0;
                            var total = parseInt(data.datasets[0].data[tooltipItems.index]);
                            var blocked = parseInt(data.datasets[1].data[tooltipItems.index]);
                            if (total > 0) {
                                percentage = 100.0 * blocked / total;
                            }
                            return data.datasets[tooltipItems.datasetIndex].label + ": " + tooltipItems.yLabel + " (" + percentage.toFixed(1) + "%)";
                        } else {
                            return data.datasets[tooltipItems.datasetIndex].label + ": " + tooltipItems.yLabel;
                        }
                    }
                }
            },
            legend: {
                display: false
            },
            scales: {
                xAxes: [{
                    type: "time",
                    time: {
                        unit: "hour",
                        displayFormats: {
                            hour: "HH:mm"
                        },
                        tooltipFormat: "HH:mm"
                    }
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            maintainAspectRatio: false
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
    }

    ngAfterViewInit() {
        this.piholeApi
            .getOvertimeData()
            .subscribe(this.onData.bind(this), this.onError.bind(this));
    }

    private sortNumberAsc = function (a, b) {
        return a - b;
    };
    private onData(data: OvertimeData) {
        let labels = [];
        //Copy datasets as settings are stored there
        let datasets = new Array<any>();
        datasets[0] = new Array();
        datasets[1] = new Array();

        // get all keys of ads datapoints
        var adsKeys = Object.keys(data.ads)
            .map(Number)
            .sort(this.sortNumberAsc);
        // get all keys of domain datapoints
        var domainKeys = Object.keys(data.queries)
            .map(Number)
            .sort(this.sortNumberAsc);
        // get the largest datapoint key
        var largest = Math.max(adsKeys[adsKeys.length - 1], domainKeys[domainKeys.length - 1]);
        // get the smallest datapoint key
        var smallest = Math.min(adsKeys[0], domainKeys[0]);
        // Add data for each hour that is available
        for (var timeInterval = smallest; timeInterval <= largest; timeInterval++) {
            var h = timeInterval;
            var d = new Date()
                .setHours(Math.floor(h / 6), 10 * (h % 6), 0, 0);
            labels.push(d);
            datasets[0].push((timeInterval in data.queries) ? data.queries[timeInterval] : 0);
            datasets[1].push((timeInterval in data.ads) ? data.ads[timeInterval] : 0);
        }
        this.chartDatasets[0].data = datasets[0];
        this.chartDatasets[1].data = datasets[1];
        this.chartLabels = labels;
        this.isLoading = false;
    }

    private onError(error: Error) {

    }

}
