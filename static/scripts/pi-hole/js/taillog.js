var offset, timer, pre, scrolling = true,
    token;
$(function() {
    token = $("token")
        .html();
    var socket = io("/private");
    pre = $("#output");
    socket.on('connect_error', function() {
        console.log("connect_error");
    });
    socket.on('error', function(data) {
        console.log("connect_error" + data);
    });
    socket.on("dnsevent", function(data) {
        console.log(data);
        pre.append(data);
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
