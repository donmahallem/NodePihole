var taillogWatcher = {};
(function(taillog) {
    const supportedEvents = ["dns"];
    var callbacks = {
        "dns": [],
        "error": [],
        "open": []
    };
    var isListening = false;

    var evSource;
    const onError = function(error) {
        emit("error", error);
    };

    const emit = function(name, event) {
        callbacks[name].forEach(function(callback) {
            callback(JSON.parse(event.data));
        });
    };
    const onDnsEvent = function(event) {
        emit("dns", event);
    };

    const onMessage = function(data) {};

    const onOpen = function() {
        emit("open");
    };

    taillog.on = function(event, callback) {
        if (supportedEvents.indexOf(event) >= 0) {
            callbacks[event].push(callback);
        }
        return function() {
            taillog.off(callback);
        };
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
