var offset, timer, pre, scrolling = true,
    token, evSource;
$(function() {
    token = $("token")
        .html();
    pre = $("#output");
    evSource = new EventSource("/api/taillog", {
        "withcredentials": true
    });
    evSource.onerror = function(err) {
        console.log("onerror");
    };
    evSource.onmessage = function(data) {
        console.log(data);
    };
    evSource.addEventListener("dns", function(e) {
        pre.append(e.data);
        if (scrolling) {
            window.scrollTo(0, document.body.scrollHeight);
        }
    }, false);
    evSource.onopen = function() {
        console.log("on open");
    };
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
