import { Component, Input } from "@angular/core";
import { PiholeService } from "./../services/pihole.service";
import { Query } from "./../services/pihole.service";
@Component({
    templateUrl: "./pihole-queries.component.pug",
})
export class PiholeQueriesComponent {
    public columns: Array<any> = [
        {
            title: "Domain",
            name: "domain",
            filtering: {
                filterString: "",
                placeholder: "Filter by name"
            }
        },
        {
            title: "Query Type",
            name: "queryType",
            sort: false
        },
        {
            title: "Client",
            name: "client",
            sort: false
        },
        {
            title: "Timestamp",
            name: "timestamp",
            sort: "desc"
        }
    ];
    public config: any = {
        paging: false,
        sorting: { columns: this.columns },
        filtering: { filterString: "" },
        className: []
    };
    private isLoading: boolean = true;
    private currentPage: number = 0;
    private totalItems: number = 100;
    private itemsPerPage: number = 10;
    private rows: any[] = [];
    private data: Query[] = [];
    constructor(private piholeService: PiholeService) {
    }

    ngAfterViewInit() {
        this.piholeService
            .api
            .getQueries()
            .subscribe(this.onDataLoaded.bind(this),
            this.onLoadError.bind(this));
    }

    private onDataLoaded(data: Query[]) {
        console.log("data loaded", data);
        this.data = data;
        this.isLoading = false;
    }

    private onLoadError(error: Error) {
        console.log("error", error);
        this.isLoading = false;
    }

    public onChangeTable(a, b) {

    }

    public onChangePage($event: { page: number, itemsPerPage: number }) {
        console.log("page changed", $event.page, $event.itemsPerPage);
    }
}