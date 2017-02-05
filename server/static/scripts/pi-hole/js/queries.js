var tableApi;

function escapeRegex(text) {
    var map = {
        "(": "\\(",
        ")": "\\)",
        ".": "\\.",
    };
    return text.replace(/[().]/g, function(m) {
        return map[m];
    });
}
// stores if the table is already displaying a loading indicator
var tableIsLoading = true;
// shows loading indicator above table
function setTableLoading(loading) {
    // dont progress if queried state is already active
    if (loading === tableIsLoading) {
        return;
    }
    tableIsLoading = loading;
    if (loading) {
        $("#recent-queries .overlay")
            .show();
    } else {
        $("#recent-queries .overlay")
            .hide();
    }
}

function refreshData() {
    tableApi.ajax.url("/api/data?allQueries")
        .load();
    //    updateSessionTimer();
}

function add(row) {
    var rowData = row.data();
    var token = $("#token")
        .html();
    var alInfo = $("#alInfo");
    var alList = $("#alList");
    var alDomain = $("#alDomain");
    alDomain.html(rowData.domain);
    var alSuccess = $("#alSuccess");
    var alFailure = $("#alFailure");
    var list;
    if (rowData.status === "Pi-holed") {
        list = "white";
        alList.html("Whitelist");
    } else {
        list = "black";
        alList.html("Blacklist");
    }
    alInfo.show();
    alSuccess.hide();
    alFailure.hide();
    setTableLoading(true);
    $.ajax({
        url: "scripts/pi-hole/php/add.php",
        method: "post",
        data: {
            "domain": rowData.domain,
            "list": list,
            "token": token
        },
        success: function(response) {
            if (response.indexOf("not a valid argument") >= 0 || response.indexOf("is not a valid domain") >= 0) {
                alFailure.show();
                alFailure.delay(1000)
                    .fadeOut(2000, function() {
                        alFailure.hide();
                    });
            } else {
                if (rowData.status === "Pi-holed") {
                    rowData.status = "Ok";
                } else {
                    rowData.status = "Pi-holed";
                }
                row.data(rowData)
                    .draw();
                alSuccess.show();
                alSuccess.delay(1000)
                    .fadeOut(2000, function() {
                        alSuccess.hide();
                    });
            }
            alInfo.delay(1000)
                .fadeOut(2000, function() {
                    alInfo.hide();
                    alList.html("");
                    alDomain.html("");
                });
            setTableLoading(false);
        },
        error: function(jqXHR, exception) {
            alFailure.show();
            alFailure.delay(1000)
                .fadeOut(2000, function() {
                    alFailure.hide();
                });
            alInfo.delay(1000)
                .fadeOut(2000, function() {
                    alInfo.hide();
                    alList.html("");
                    alDomain.html("");
                });
            setTableLoading(false);
        }
    });
}
$(document)
    .ready(function() {
        // Do we want to filter queries?
        var GETDict = {};
        location.search.substr(1)
            .split("&")
            .forEach(function(item) {
                GETDict[item.split("=")[0]] = item.split("=")[1];
            });
        var APIstring = "/api/history";
        if ("from" in GETDict) {
            APIstring += "&from=" + GETDict["from"];
        }
        if ("until" in GETDict) {
            APIstring += "&until=" + GETDict["until"];
        }
        tableApi = $("#all-queries")
            .DataTable({
                "rowCallback": function(row, data, index) {
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
                },
                "initComplete": function(settings, json) {
                    setTableLoading(false);
                    //alert( 'DataTables has finished its initialisation.' );
                },
                dom: "<'row'<'col-sm-12'f>>" +
                    "<'row'<'col-sm-4'l><'col-sm-8'p>>" +
                    "<'row'<'col-sm-12'tr>>" +
                    "<'row'<'col-sm-5'i><'col-sm-7'p>>",
                "ajax": {
                    "url": APIstring,
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
                }, ],
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
        $("#all-queries tbody")
            .on("click", "button", function() {
                var row = tableApi.row($(this)
                    .parents("tr"));
                add(row);
            });
        if ("client" in GETDict) {
            // Search in third column (zero indexed)
            // Use regular expression to only show exact matches, i.e.
            // don't show 192.168.0.100 when searching for 192.168.0.1
            // true = use regex, false = don't use smart search
            tableApi.column(3)
                .search("^" + escapeRegex(GETDict["client"]) + "$", true, false);
        }
        if ("domain" in GETDict) {
            // Search in second column (zero indexed)
            tableApi.column(2)
                .search("^" + escapeRegex(GETDict["domain"]) + "$", true, false);
        }
    });
