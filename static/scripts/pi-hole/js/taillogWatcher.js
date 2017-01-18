var taillogWatcher = {};
(function(taillog) {
    const supportedEvents = ["dns"];
    var callbacks = {
        "dns": []
    };
    var isListening = false;

    const onError = function(error) {};

    const onDnsEvent = function(event) {
        callbacks["dns"].forEach(function(callback) {
            callback(JSON.parse(event.data));
        });
    };

    const onMessage = function(data) {};

    const onOpen = function() {
        console.log("on open");
    };

    taillog.on = function(event, callback) {
        if (supportedEvents.indexOf(event) >= 0) {
            callbacks[event].push(callback);
        }
    };

    taillog.off = function(event, callback) {
        if (supportedEvents.indexOf(event) >= 0) {
            const callbackIdx = callbacks[event].indexOf(callback);
            if (callbackIdx !== -1) {
                delete callbacks[event][callbackIdx];
            }
        }
    };

    taillog.listen = function() {
        if (!isListening) {
            isListening = true;
            evSource = new EventSource("/api/taillog", {
                "withcredentials": true
            });
            evSource.onerror = onError;
            evSource.onmessage = onMessage;
            evSource.addEventListener("dns", onDnsEvent, false);
            evSource.onopen = onOpen;
        }
    };
}(taillogWatcher));
taillogWatcher.listen();
