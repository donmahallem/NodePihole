var taillogWatcher = {};
(function() {
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
        $(taillogWatcher)
            .trigger("light:toggle", JSON.parse(e.data));
    }, false);
    evSource.onopen = function() {
        console.log("on open");
    };
})();
