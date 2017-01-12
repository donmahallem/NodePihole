var offset, timer, pre, scrolling = true;
$(function() {
    var socket = io();
    pre = $("#output");
    socket.on("deny", function(data) {
        console.log(data);
        pre.append(data["lines"]);
        if (scrolling) {
            window.scrollTo(0, document.body.scrollHeight);
        }
    });
});

$("#chk1")
    .click(function() {
        $("#chk2")
            .prop("checked", this.checked);
        scrolling = this.checked;
    });
$("#chk2")
    .click(function() {
        $("#chk1")
            .prop("checked", this.checked);
        scrolling = this.checked;
    });
