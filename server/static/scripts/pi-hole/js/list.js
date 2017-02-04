// IE likes to cache too much :P
$.ajaxSetup({
    cache: false
});
// Get PHP info
var domainList = {};
(function(dList) {
    const token = $("#token")
        .html();
    const listType = $("#list-type")
        .html();
    const fullName = listType === "white" ? "Whitelist" : "Blacklist";
    const alInfo = $("#alInfo");
    const alSuccess = $("#alSuccess");
    const alFailure = $("#alFailure");
    const domain = $("#domain");
    const list = $("#list");

    //Callbacks
    const addCallbacks = {
        "success": function(response) {
            if (response.indexOf("not a valid argument") >= 0 ||
                response.indexOf("is not a valid domain") >= 0) {
                alFailure.show();
                alFailure.delay(1000)
                    .fadeOut(2000, function() {
                        alFailure.hide();
                    });
                alInfo.delay(1000)
                    .fadeOut(2000, function() {
                        alInfo.hide();
                    });
            } else {
                alSuccess.show();
                alSuccess.delay(1000)
                    .fadeOut(2000, function() {
                        alSuccess.hide();
                    });
                alInfo.delay(1000)
                    .fadeOut(2000, function() {
                        alInfo.hide();
                    });
                domain.val("");
                dList.refresh(true);
            }
        },
        "error": function(jqXHR, exception) {
            alFailure.show();
            alFailure.delay(1000)
                .fadeOut(2000, function() {
                    alFailure.hide();
                });
            alInfo.delay(1000)
                .fadeOut(2000, function() {
                    alInfo.hide();
                });
        }
    };
    const subCallbacks = {
        "error": function(jqXHR, exception) {
            domain.show({
                queue: true
            });
            alert("Failed to remove the domain!");
        },
        "success": function(response) {
            if (response.length !== 0) {
                return;
            }
            domain.remove();
        }
    };
    const refreshCallbacks = {
        "success": function(data) {
            list.html("");
            if (data.length === 0) {
                list.html("<div class=\"alert alert-info\" role=\"alert\">Your " + fullName + " is empty!</div>");
            } else {
                data.forEach(function(entry, index) {
                    list.append(
                        "<li id=\"" + index + "\" class=\"list-group-item clearfix\">" + entry.domain +
                        "<button class=\"btn btn-danger btn-xs pull-right\" type=\"button\">" +
                        "<span class=\"glyphicon glyphicon-trash\"></span></button></li>"
                    );
                    // Handle button
                    $("#list #" + index + "")
                        .on("click", "button", function() {
                            dList.sub(index, entry);
                        });
                });
            }
            list.fadeIn("fast");
        },
        "error": function(jqXHR, exception) {
            $("#alFailure")
                .show();
        }
    };

    dList.add = function() {
        if (domain.val()
            .length === 0) {
            return;
        }
        alInfo.show();
        alSuccess.hide();
        alFailure.hide();
        $.ajax({
            url: "api/list",
            method: "post",
            data: {
                "domain": domain.val(),
                "list": listType,
                "token": token
            },
            success: addCallbacks.success,
            error: addCallbacks.error
        });
    };
    dList.sub = function(index, entry) {
        domain.hide("highlight");
        $.ajax({
            url: "api/list",
            method: "delete",
            data: {
                "domain": entry,
                "list": listType,
                "token": token
            },
            success: subCallbacks.success,
            error: subCallbacks.error
        });
    };
    dList.refresh = function(fade) {
        if (fade) {
            list.fadeOut(100);
        }
        $.ajax({
            url: "/api/list",
            method: "get",
            data: {
                "list": listType
            },
            success: refreshCallbacks.success,
            error: refreshCallbacks.error
        });
    }
}(domainList));

window.onload = domainList.refresh(false);

// Handle enter button for adding domains
$(document)
    .keypress(function(e) {
        if (e.which === 13 && $("#domain")
            .is(":focus")) {
            // Enter was pressed, and the input has focus
            domainList.add();
        }
    });
// Handle buttons
$("#btnAdd")
    .on("click", function() {
        domainList.add();
    });
$("#btnRefresh")
    .on("click", function() {
        domainList.refresh(true);
    });
// Handle hiding of alerts
$(function() {
    $("[data-hide]")
        .on("click", function() {
            $(this)
                .closest("." + $(this)
                    .attr("data-hide"))
                .hide();
        });
});
