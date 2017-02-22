import { Component, Input } from '@angular/core';
import { PiholeService } from "./../services/pihole.service";

@Component({
    templateUrl: "./pihole-queries.component.pug"
})
export class PiholeQueriesComponent {
    public columns: Array<any> = [
        { title: 'Name', name: 'name', filtering: { filterString: '', placeholder: 'Filter by name' } },
        {
            title: 'Position',
            name: 'position',
            sort: false,
            filtering: { filterString: '', placeholder: 'Filter by position' }
        },
        { title: 'Office', className: ['office-header', 'text-success'], name: 'office', sort: 'asc' },
        { title: 'Extn.', name: 'ext', sort: '', filtering: { filterString: '', placeholder: 'Filter by extn.' } },
        { title: 'Start date', className: 'text-warning', name: 'startDate' },
        { title: 'Salary ($)', name: 'salary' }
    ];
    public config: any = {
        paging: false,
        sorting: { columns: this.columns },
        filtering: { filterString: '' },
        className: ['table-striped', 'table-bordered']
    };
    private isLoading: boolean = false;
    private currentPage: number = 0;
    private totalItems: number = 100;
    private itemsPerPage: number = 10;
    private rows: any[] = [];
    constructor(private piholeService: PiholeService) {
        for (let i = 0; i < 200; i++) {
            this.rows.push({ name: "a", salary: "b" });
        }
    }

    public onChangeTable(a, b) {

    }

    public onChangePage($event: { page: number, itemsPerPage: number }) {
        console.log("page changed", $event.page, $event.itemsPerPage);
    }
}