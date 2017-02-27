import { Component, Input, ElementRef } from "@angular/core";
import { Query } from "./../services/pihole-api.service";
import { PageChangedEvent } from "ng2-bootstrap/pagination/pagination.component";
import * as moment from "moment";
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/fromEvent';

class TableConfig {
    itemsPerPage: number = 100;
    currentPage: number = 0;
    totalItems: number = 0;
}

/**
 * Sorts Query Objects by the sortByDate
 * @param asc defines if the Queries should be sorted ascending or descending
 */
function sortByDate(asc: boolean = true) {
    return function (a: Query, b: Query): number {
        return (asc ? 1 : -1) * moment.utc(a.timestamp).diff(moment.utc(b.timestamp));
    }
}

@Component({
    selector: "table[queries-table]",
    templateUrl: "./pihole-queries-table.component.pug"
})
export class PiholeQueriesTableComponent {

    private startIdx: number = 0;
    private endIdx: number = 0;
    private mInputData: Query[];
    private visibleRows: Query[];
    private config: TableConfig = new TableConfig();
    private sortWorker: Worker;
    private sortObservable: Observable<any>;
    private sortSubscription: Subscription;
    constructor() {
        this.sortWorker = new Worker("assets/scripts/sort.worker.js");
        this.sortObservable = Observable.fromEvent(this.sortWorker, "onmessage");
        this.sortSubscription = this.sortObservable.subscribe(this.onSorted.bind(this));
        this.sortWorker.onmessage = function (e) {
            this.onSorted(e.data);
        }.bind(this);
    }

    private onSorted(list: Query[]) {
        this.mInputData = list;
        this.config.totalItems = list.length;
        this.visibleRows = list;
        this.updateView();
        console.log("rec", list, this.visibleRows);
    }
    private asyncSort(data): Observable<Query[]> {
        let worker = new Worker("assets/js/sort.worker.js");
        worker.postMessage(data);
        return Observable.fromEvent(worker, "onmessage");
    }


    @Input("inputData")
    public set inputData(data: Query[]) {
        //this.mInputData = data.sort(sortByDate(true));
        this.sortWorker.postMessage(data);
    }

    public updateView() {
        this.startIdx = this.config.currentPage * this.config.itemsPerPage;
        this.endIdx = this.startIdx + this.config.itemsPerPage;
        //this.visibleRows = this.mInputData.slice(startIdx, startIdx + this.config.itemsPerPage);
    }

    public get inputData(): Query[] {
        return this.mInputData;
    }


    @Input("itemsPerPage")
    public set itemsPerPage(itemsPerPage: number) {
        this.config.itemsPerPage = Math.max(1, itemsPerPage);
    }

    public get itemsPerPage(): number {
        return this.config.itemsPerPage;
    }

    public onPageChanged($event: PageChangedEvent) {
        this.config.currentPage = $event.page;
        this.updateView();
    }


    private numPages: number = 0;


    ngAfterViewInit() {
    }

}