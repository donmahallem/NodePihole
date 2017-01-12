var offset, timer, pre, scrolling = true,
    token;
$(function() {
    var socket = io("/private");
    token = $("token")
        .html();
    pre = $("#output");

    socket.on('connect', function() {
        socket
            .emit('authenticate', {
                "token": token
            }) //send the jwt
            .on('authenticated', function() {
                console.log("authenticated");
            })
            .on('unauthorized', function(msg) {
                console.log("unauthorized: " + JSON.stringify(msg.data));
                throw new Error(msg.data.type);
            })
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
