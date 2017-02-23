import { Component, Input, ElementRef } from "@angular/core";

@Component({
    selector: "table[queries-table]",
    templateUrl: "./pihole-queries-table.component.pug"
})
export class PiholeQueriesTableComponent {
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

    private visibleRows: any[];
    public config: any = {
        paging: false,
        sorting: { columns: this.columns },
        filtering: { filterString: "" },
        className: []
    };
    private dataTable: DataTables.DataTable;
    constructor(private elementRef: ElementRef) {
        console.log(this.elementRef);
    }

    ngAfterViewInit() {
        $(this.elementRef.nativeElement)
            .DataTable({
                "rowCallback": function (row, data, index) {
                    /*
                    if (data.status === "Pi-holed") {
                        $(row)
                            .css("color", "red");
                        $("td:eq(5)", row)
                            .html("<button style=\"color:green;\"><i class=\"fa fa-pencil-square-o\"></i> Whitelist</button>");
                    } else {
                        $(row)
                            .css("color", "green");
                        $("td:eq(5)", row)
                            .html("<button style=\"color:red;\"><i class=\"fa fa-ban\"></i> Blacklist</button>");
                    }
                    */
                },
                "initComplete": function (settings, json) {
                    //setTableLoading(false);
                    //alert( 'DataTables has finished its initialisation.' );
                },
                dom: "<'row'<'col-sm-12'f>>" +
                "<'row'<'col-sm-4'l><'col-sm-8'p>>" +
                "<'row'<'col-sm-12'tr>>" +
                "<'row'<'col-sm-5'i><'col-sm-7'p>>",
                "ajax": {
                    "url": "/api/history?type=query",
                    "dataSrc": "data"
                },
                "autoWidth": false,
                "order": [
                    [0, "desc"]
                ],
                "columns": [{
                    "width": "20%",
                    "data": "timestamp",
                    "type": "date"
                }, {
                    "width": "10%",
                    "data": "type"
                }, {
                    "width": "40%",
                    "data": "domain"
                }, {
                    "width": "10%",
                    "data": "client"
                }, {
                    "width": "10%",
                    "data": "status"
                }, {
                    "width": "10%",
                    "data": "action"
                },],
                "lengthMenu": [
                    [10, 25, 50, 100, -1],
                    [10, 25, 50, 100, "All"]
                ],
                "columnDefs": [{
                    "targets": -1,
                    "data": null,
                    "defaultContent": ""
                }]
            });
    }

}