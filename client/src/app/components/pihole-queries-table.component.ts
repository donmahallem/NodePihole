import { Component, Input, ElementRef } from "@angular/core";
import { Query } from "./../services/pihole.service";
import { PageChangedEvent } from "ng2-bootstrap/pagination/pagination.component";
import * as moment from "moment";

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
    @Input("inputData")
    public set inputData(data: Query[]) {
        console.log(data);
        this.mInputData = data.sort(sortByDate(true));
        this.config.totalItems = data.length;
        this.visibleRows = data;
        this.updateView();
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

    constructor(private elementRef: ElementRef) {
        console.log(this.elementRef);
    }

    ngAfterViewInit() {
    }

}