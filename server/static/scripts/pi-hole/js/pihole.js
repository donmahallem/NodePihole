/**
 *  @typedef PropertiesHash
 *  @type {object}
 * @property {string} id - an ID.
 *  @property {string} name - your name.
 * @property {number} age - your age.
 */

/**
 * Module for communication with the backend
 * @module pihole
 * @global
 * @since 1.0.0
 */
var pihole = (function(pihole, $, undefined) {
    'use strict';
    var api = pihole.api = pihole.api || {};
    /**
     * Module for communication with the backend
     * @module pihole/api
     * @since 1.0.0
     */
    /**
     * Api for data endpoint
     * @module pihole/api/data
     * @since 1.0.0
     */
    api.data = {
        /**
         * @memberof module:pihole/api/data
         * @since 1.0.1
         */
        getSummary: function() {
            return $.ajax({
                "url": "/api/data/summary",
                "headers": {
                    "Accept": "application/json; charset=utf-8",
                    "Content-Type": "application/json; charset=utf-8"
                },
                "method": "get",
                "dataType": "json"
            });
        },
        /**
         * @memberof module:pihole/api/data/
         * @since 1.0.1
         */
        getForwardDestinations: function() {
            return $.ajax({
                "url": "/api/data/forwardDestinations",
                "headers": {
                    "Accept": "application/json; charset=utf-8",
                    "Content-Type": "application/json; charset=utf-8"
                },
                "method": "get",
                "dataType": "json"
            });
        },
        /**
         * @memberof module:pihole/api/data/
         * @since 1.0.1
         */
        getQuerySources: function() {
            return $.ajax({
                "url": "/api/data/querySources",
                "headers": {
                    "Accept": "application/json; charset=utf-8",
                    "Content-Type": "application/json; charset=utf-8"
                },
                "method": "get",
                "dataType": "json"
            });
        },
        /**
         * @memberof module:pihole/api/data/
         * @since 1.0.1
         */
        getQueryTypes: function() {
            return $.ajax({
                "url": "/api/data/queryTypes",
                "headers": {
                    "Accept": "application/json; charset=utf-8",
                    "Content-Type": "application/json; charset=utf-8"
                },
                "method": "get",
                "dataType": "json"
            });
        },
        /**
         * @memberof module:pihole/api/data/
         * @since 1.0.1
         */
        getTopItems: function() {
            return $.ajax({
                "url": "/api/data/topItems",
                "headers": {
                    "Accept": "application/json; charset=utf-8",
                    "Content-Type": "application/json; charset=utf-8"
                },
                "method": "get",
                "dataType": "json"
            });
        },
        /**
         * @memberof module:pihole/api/data/
         * @since 1.0.1
         */
        getOvertimeData: function() {
            return $.ajax({
                "url": "/api/data/overtimeData",
                "headers": {
                    "Accept": "application/json; charset=utf-8",
                    "Content-Type": "application/json; charset=utf-8"
                },
                "method": "get",
                "dataType": "json"
            });
        }
    };
    /**
     * Api for data endpoint
     * @module pihole/api/log
     * @since 1.0.1
     */
    api.log = {
        /**
         * @memberof module:pihole/api/log
         * @since 1.0.1
         */
        get: function(type) {
            return $.ajax({
                "url": "/api/log",
                "headers": {
                    "Accept": "application/json; charset=utf-8",
                    "Content-Type": "application/json; charset=utf-8"
                },
                "method": "get",
                "dataType": "json",
                "data": {
                    "type": type
                }
            });
        }
    };
    /**
     * Api for status endpoint
     * @module pihole/api/log
     * @since 1.0.1
     */
    api.status = {
        /**
         * @memberof module:pihole/api/log
         * @since 1.0.1
         */
        getStatus: function(type) {
            return $.ajax({
                "url": "/api/status",
                "headers": {
                    "Accept": "application/json; charset=utf-8",
                    "Content-Type": "application/json; charset=utf-8"
                },
                "method": "get",
                "dataType": "json"
            });
        }
    };
    /**
     * Api for list endpoint
     * @module pihole/api/list
     * @since 1.0.0
     */
    api.list = {
        /**
         * @param {String} listname - either <code>black</code> or <code>white</code>
         * @memberof module:pihole/api/list
         *@since 1.0.0
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
         * @since 1.0.0
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
         * @since 1.0.0
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
    return pihole;
}(pihole || {}, jQuery));
var pihole = (function(pihole, $, undefined) {
    'use strict';
    var taillog = pihole.taillog = pihole.taillog || {};
    /**
     * Module for communication with the backend
     * @module pihole/taillog
     * @since 1.0.0
     */
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
    /**
     * @function subscribe
     * @param {String} event - the event to subscribe too
     * @param {Function} callback - the callback to call if the requested event is emitted
     * @returns {Function} can be called to unsubscribe the callback
     * @memberof module:pihole/taillog
     * @since 1.0.0
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
     * @since 1.0.0
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
    return pihole;
}(pihole || {}, jQuery));

var pihole = (function(pihole, $, undefined) {
    'use strict';
    var helper = pihole.helper = pihole.helper || {};
    /**
     * @module {Object} module:pihole/helper
     * @since 1.0.0
     */

    /**
     *@member {String|Null} apiToken
     * @inner
     */
    var apiToken;
    /**
     * Retrieves the csrf token from the document body if present
     * @function getApiToken
     * @returns {String} the api token if available
     * @memberof module:pihole/helper
     * @since 1.0.0
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
     * @since 1.0.0
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
    return pihole;
}(pihole || {}, jQuery));
