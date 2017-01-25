(function(window, $, undefined) {
    'use strict';
    if (typeof(pihole) !== 'undefined') {
        return;
    }
    var pihole = {};
    const settings = {
        "enable": function() {

        },
        "disable": function() {

        }
    };

    pihole.api = {};
    pihole.api.data = {
        "get": function(args, successCallback, errorCallback) {
            $.ajax({
                url: "/api/data",
                method: "get",
                data: args,
                success: successCallback,
                error: errorCallback
            });
        }
    };
    pihole.api.list = {
        "get": function(listname, successCallback, errorCallback) {
            $.ajax({
                url: "/api/list",
                method: "get",
                data: {
                    "list": listname
                },
                success: successCallback,
                error: errorCallback
            });
        },
        "post": function(listname, domain, successCallback, errorCallback) {
            $.ajax({
                url: "api/list",
                method: "post",
                data: {
                    "domain": domain,
                    "list": listname,
                    "token": pihole.helper.getApiToken()
                },
                success: successCallback,
                error: errorCallback
            });
        },
        "delete": function(listname, domain, successCallback, errorCallback) {
            $.ajax({
                url: "api/list",
                method: "delete",
                data: {
                    "domain": domain,
                    "list": listname,
                    "token": pihole.helper.getApiToken()
                },
                success: successCallback,
                error: errorCallback
            });
        }
    };
    pihole.api.taillog = (function() {
        const supportedEvents = ["dns"];
        var callbacks = {
            "dns": [],
            "error": [],
            "open": []
        };
        var isListening = false;

        var evSource;

        const emit = function(name, event) {
            callbacks[name].forEach(function(callback) {
                callback(JSON.parse(event.data));
            });
        };

        const onError = function(error) {
            isListening = false;
            emit("error", error);
        };

        const onDnsEvent = function(event) {
            emit("dns", event);
        };

        const onMessage = function(data) {};

        const onOpen = function() {
            isListening = true;
            emit("open");
        };
        var taillog = {};
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
        return taillog;
    })();
    pihole.helper = (function() {
        var apiToken;
        var helper = {};
        helper.getApiToken = function() {
            if (apiToken === undefined) {
                apiToken = $("#token")
                    .html();
            }
            return apiToken;
        };
        return helper;
    })();

    pihole.settings = settings;
    window.pihole = pihole;
})(window, $);
