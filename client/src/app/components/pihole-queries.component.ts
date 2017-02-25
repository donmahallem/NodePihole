import { Component, Input } from "@angular/core";
import { PiholeApiService } from "./../services/pihole-api.service";
import { Query } from "./../services/pihole-api.service";
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
    constructor(private piholeApi: PiholeApiService) {
    }

    ngAfterViewInit() {
        this.piholeApi
            .getQueries()
            .subscribe(this.onDataLoaded.bind(this),
            this.onLoadError.bind(this));
    }

    private onDataLoaded(data: Query[]) {
        this.data = data;
        this.isLoading = false;
    }

    private onLoadError(error: Error) {
        this.isLoading = false;
    }

    public onChangeTable(a, b) {

    }

    public onChangePage($event: { page: number, itemsPerPage: number }) {
    }
}