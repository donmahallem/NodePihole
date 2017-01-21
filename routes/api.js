const express = require("express");
const readline = require("readline");
const moment = require("moment");
const fs = require("fs");
const logHelper = require("./../logHelper.js");
const appDefaults = require("./../defaults.js");
const helper = require("./../helper.js");
const exec = require("child_process")
    .exec;
var router = express.Router();

const supportedDataQueries = {
    "summary": {
        "authRequired": false
    },
    "summaryRaw": {
        "authRequired": false
    },
    "overTimeData": {
        "authRequired": true
    },
    "overTimeData10mins": {
        "authRequired": false
    },
    "topItems": {
        "authRequired": true
    },
    "recentItems": {
        "authRequired": true
    },
    "getQueryTypes": {
        "authRequired": true
    },
    "getForwardDestinations": {
        "authRequired": true
    },
    "getAllQueries": {
        "authRequired": true
    },
    "getQuerySources": {
        "authRequired": true
    }
};

/*
Special middleware for api endpoint as no login redirect will be shown
*/
const apiMiddleware = {
    auth: function(req, res, next) {
        if (req.user.authenticated) {
            next();
        } else {
            console.log("auth didnt match");
            res.sendStatus(401);
        }
    },
    csrf: function(req, res, next) {
        if (req.body.token && req.body.token === helper.hashWithSalt(req.user.csrfToken, appDefaults.csrfSecret)) {
            next();
        } else {
            console.log("csrf didnt match");
            res.sendStatus(401);
        }
    }
};
// Potential buildfail fix for node 5 and below
// polyfill source: https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
if (typeof Object.assign != "function") {
    Object.assign = function(target) {
        "use strict";
        if (target == null) {
            throw new TypeError("Cannot convert undefined or null to object");
        }
        target = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source != null) {
                for (var key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key];
                    }
                }
            }
        }
        return target;
    };
}
///// for node 5 and below
// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, "includes", {
        value: function(searchElement, fromIndex) {
            // 1. Let O be ? ToObject(this value).
            if (this == null) {
                throw new TypeError("\"this\" is null or not defined");
            }
            var o = Object(this);
            // 2. Let len be ? ToLength(? Get(O, "length")).
            var len = o.length >>> 0;
            // 3. If len is 0, return false.
            if (len === 0) {
                return false;
            }
            // 4. Let n be ? ToInteger(fromIndex).
            //    (If fromIndex is undefined, this step produces the value 0.)
            var n = fromIndex | 0;
            // 5. If n ≥ 0, then
            //  a. Let k be n.
            // 6. Else n < 0,
            //  a. Let k be len + n.
            //  b. If k < 0, let k be 0.
            var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
            // 7. Repeat, while k < len
            while (k < len) {
                // a. Let elementK be the result of ? Get(O, ! ToString(k)).
                // b. If SameValueZero(searchElement, elementK) is true, return true.
                // c. Increase k by 1.
                // NOTE: === provides the correct "SameValueZero" comparison needed here.
                if (o[k] === searchElement) {
                    return true;
                }
                k++;
            }
            // 8. Return false
            return false;
        }
    });
}
/////////////////////////////////////////////

router.get("/data", function(req, res) {
    // Filter query types so only valid ones pass
    var args = {};
    // to cancel request early if no valid args were provided
    var numValidArgs = 0;
    for (var query in req.query) {
        // type check so someone can't query for example .toString()
        if (query in supportedDataQueries && (typeof supportedDataQueries[query].authRequired === "boolean")) {
            if (supportedDataQueries[query].authRequired && !req.user.authenticated) {
                // User needs to be authenticated for this query
                res.sendStatus(401);
                return;
            }
            args[query] = req.query[query];
            numValidArgs++;
        }
    }
    // cancel request because no valid args were provided
    if (numValidArgs === 0) {
        res.sendStatus(400);
        return;
    }

    var data = {};
    var promises = [];
    if ("summary" in args) {
        promises.push(logHelper.getSummary());
    }
    if ("summaryRaw" in args) {
        promises.push(logHelper.getSummary());
    }
    if ("overTimeData10mins" in args) {
        promises.push(logHelper.getOverTimeData10mins());
    }
    if ("topItems" in args) {
        promises.push(logHelper.getTopItems());
    }
    if ("getQueryTypes" in args) {
        promises.push(logHelper.getQueryTypes());
    }
    if ("getForwardDestinations" in args) {
        promises.push(logHelper.getForwardDestinations());
    }
    if ("getAllQueries" in args) {
        promises.push(logHelper.getAllQueries());
    }
    if ("getQuerySources" in args) {
        promises.push(logHelper.getQuerySources());
    }
    Promise.all(promises)
        .then(function(values) {
            var data = {};
            for (var i = 0; i < values.length; i++) {
                data = Object.assign(data, values[i]);
            }
            res.json(data);
        })
        .catch(function(err) {
            console.log(err);
            res.sendStatus(400);
        });
});

router.get("/taillog",
    apiMiddleware.auth,
    function(req, res) {
        var connectionOpen = true;
        var updateInterval;
        req.on("close", function() {
            if (connectionOpen) {
                connectionOpen = false;
                clearInterval(updateInterval);
                console.log("Request close");
            }
        });

        req.on("end", function() {
            if (connectionOpen) {
                connectionOpen = false;
                clearInterval(updateInterval);
                console.log("Request end");
            }
        });
        res.set({
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*"
        });

        res.write("event: ping\n\n");
        updateInterval = setInterval(function() {
            res.write("id: 19\n");
            res.write("event: dns\n");
            res.write("data: {\"timestamp\":\"2017-01-18T21:34:20Z\",\"type\":\"query\"}\n\n");
        }, 1000);
    });

router.get("/list", function(req, res) {
    if (!req.user.authenticated) {
        res.sendStatus(401);
    } else if ("list" in req.query && (req.query.list === "white" || req.query.list === "black")) {
        var filepath;
        if (req.query.list === "white") {
            filepath = appDefaults.whiteListFile;
        } else {
            filepath = appDefaults.blackListFile;
        }
        fs.access(filepath, fs.F_OK | fs.R_OK, function(err) {
            if (err) {
                res.status(500);
                res.send("Could not open " + req.query.list + "list file");
            } else {
                var lines = [];
                var lineReader = require("readline")
                    .createInterface({
                        input: require("fs")
                            .createReadStream(filepath)
                    });
                lineReader.on("line", function(line) {
                    if (line === "") {
                        return;
                    }
                    lines.push(line);
                });
                lineReader.on("close", function() {
                    res.json(lines);
                });
            }
        });
    } else {
        res.sendStatus(400);
    }
});

router.post("/list",
    apiMiddleware.auth,
    apiMiddleware.csrf,
    function(req, res) {
        var domain = req.body.domain;
        var list = req.body.list;
        if (domain && list) {
            if (list === "white") {
                exec("sudo pihole -w -q " + domain);
                res.end();
            } else if (list === "black") {
                exec("sudo pihole -b -q " + domain);
                res.end();
            } else {
                res.sendStatus(401);
            }
        } else {
            res.sendStatus(404);
        }
    });

router.delete("/list",
    apiMiddleware.auth,
    apiMiddleware.csrf,
    function(req, res) {
        var domain = req.body.domain;
        var list = req.body.list;
        if (domain && list) {
            if (list === "white") {
                exec("sudo pihole -w -q -d " + domain);
                res.end();
            } else if (list === "black") {
                exec("sudo pihole -b -q -d " + domain);
                res.end();
            } else {
                res.sendStatus(401);
            }
        } else {
            res.sendStatus(404);
        }
    });

router.post("/enable",
    apiMiddleware.auth,
    apiMiddleware.csrf,
    function(req, res) {
        exec("sudo pihole enable", function(error, stdout, stderr) {
            if (error || stderr.trim() !== "") {
                res.sendStatus(500);
            } else {
                res.json({
                    "status": "enabled"
                });
            }
        });
    }
);

router.post("/disable",
    apiMiddleware.auth,
    apiMiddleware.csrf,
    function(req, res) {
        if (req.body.time && !isNaN(req.body.time)) {
            var disableTime = Math.floor(Number(req.body.time));
            exec("sudo pihole disable" + (disableTime > 0 ? disableTime + "s" : ""), function(error, stdout, stderr) {
                if (error || stderr.trim() !== "") {
                    res.sendStatus(500);
                } else {
                    res.json({
                        "status": "disabled"
                    });
                }
            });
        } else {
            res.sendStatus(400);
        }
    }
);
module.exports = router;
