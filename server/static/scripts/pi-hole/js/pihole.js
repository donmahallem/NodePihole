(function(window, $, undefined) {
    'use strict';
    if (typeof(pihole) !== 'undefined') {
        return;
    }
    /**
     * doc pihole
     * @module pihole
     */
    var pihole = {};
    const settings = {
        "enable": function() {

        },
        "disable": function() {

        }
    };

    /**
     * @module pihole/api
     */
    pihole.api = {};
    /**
     * @module pihole/api/data
     */
    pihole.api.data = {
        /**
         * @param {Object} args - args to query
         * @memberof module:pihole/api/data
         */
        get: function(args) {
            return $.ajax({
                "url": "/api/data",
                "headers": {
                    "Accept": "application/json; charset=utf-8",
                    "Content-Type": "application/json; charset=utf-8"
                },
                "method": "get",
                "dataType": "json",
                "data": args
            });
        }
    };
    /**
     * @module pihole/api/list
     */
    pihole.api.list = {
        /**
         * @param {String} listname - either <code>black</code> or <code>white</code>
         * @memberof module:pihole/api/list
         */
        "get": function(listname) {
            return $.ajax({
                "url": "/api/list",
                "headers": {
                    "Accept": "application/json; charset=utf-8",
                    "Content-Type": "application/json; charset=utf-8"
                },
                "method": "get",
                "dataType": "json",
                "data": {
                    "list": listname
                }
            });
        },
        /**
         * @param {String} listname - either <code>black</code> or <code>white</code>
         * @param {String} domain - the domain to add to the list
         * @memberof module:pihole/api/list
         */
        "post": function(listname, domain) {
            return $.ajax({
                "url": "/api/list",
                "headers": {
                    "Accept": "application/json; charset=utf-8",
                    "Content-Type": "application/json; charset=utf-8"
                },
                "method": "post",
                "dataType": "json",
                "data": {
                    "domain": domain,
                    "list": listname,
                    "token": pihole.helper.getApiToken()
                }
            });
        },
        /**
         * @param {String} listname - either <code>black</code> or <code>white</code>
         * @param {String} domain - the domain to remove from the list
         * @memberof module:pihole/api/list
         */
        "delete": function(listname, domain) {
            return $.ajax({
                "url": "/api/list",
                "headers": {
                    "Accept": "application/json; charset=utf-8",
                    "Content-Type": "application/json; charset=utf-8"
                },
                "method": "delete",
                "dataType": "json",
                "data": {
                    "domain": domain,
                    "list": listname,
                    "token": pihole.helper.getApiToken()
                }
            });
        }
    };
    /**
     * @module pihole/taillog
     */
    pihole.taillog = (function() {
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
        /**
         * @function subscribe
         * @param {String} event - the event to subscribe too
         * @param {Function} callback - the callback to call if the requested event is emitted
         * @returns {Function} can be called to unsubscribe the callback
         * @memberof module:pihole/taillog
         */
        taillog.subscribe = function(event, callback) {
            if (supportedEvents.indexOf(event) >= 0) {
                callbacks[event].push(callback);
            }
            return function() {
                taillog.unsubscribe(callback);
            };
        };

        /**
         * @function unsubscribe
         * @param {String} event - the event to subscribe too
         * @param {Function} callback - the callback to call if the requested event is emitted
         * @memberof module:pihole/taillog
         */
        taillog.unsubscribe = function(event, callback) {
            if (supportedEvents.indexOf(event) >= 0) {
                const callbackIdx = callbacks[event].indexOf(callback);
                if (callbackIdx !== -1) {
                    callbacks[event].splice(callbackIdx, 1);
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

    /**
     * @module pihole/helper
     */
    pihole.helper = (function() {
        var apiToken;
        var helper = {};
        /**
         * Retrieves the csrf token from the document body if present
         * @function getApiToken
         * @returns {String} the api token if available
         * @memberof module:pihole/helper
         */
        helper.getApiToken = function() {
            if (apiToken === undefined) {
                apiToken = $("#token")
                    .html();
            }
            return apiToken;
        };
        /**
         * Converts a timestamp to a frame index number
         * @function timestampToFrameIdx
         * @param {Date|String} timestamp - The timestamp to convert
         * @param {Number} frameSize - The frameSize in Minutes
         * @returns {Number} the frame index number
         * @memberof module:pihole/helper
         */
        helper.timestampToFrameIdx = function(timestamp, frameSize) {
            var _timestamp;
            if (typeof timestamp === "date") {
                _timestamp = timestamp;
            } else {
                _timestamp = new Date(timestamp);
            }
            const hours = _timestamp.getHours();
            const minutes = _timestamp.getMinutes();
            return Math.floor((hours * 60 + minutes) / frameSize);
        };
        return helper;
    })();

    pihole.settings = settings;
    window.pihole = pihole;
})(window, $);
