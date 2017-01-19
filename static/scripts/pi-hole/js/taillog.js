/* globals taillogWatcher */

(function() {
    var scrolling = true;
    const token = $("token")
        .html();
    const pre = $("#output");
    const chk1 = $("#chk1");
    const chk2 = $("#chk2");
    const chkCallback = function() {
        if ($(this).is(chk1)) {
            chk2.prop("checked", this.checked);
        } else if ($(this).is(chk2)) {
            chk1.prop("checked", this.checked);
        }
        scrolling = this.checked;
    };
    chk1.click(chkCallback);
    chk2.click(chkCallback);
    taillogWatcher
        .on("dns", function(data) {
            pre.append(data.timestamp);
            if (scrolling) {
                window.scrollTo(0, document.body.scrollHeight);
            }
        });
}());
