/*eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */

const express = require("express");
const readline = require("readline");
const moment = require("moment");
const fs = require("fs");
const logHelper = require("./../logHelper.js");
const appDefaults = require("./../defaults.js");
const helper = require("./../helper.js");
const childProcess = require("child_process");
const through2 = require("through2");

/**
 * @apiDefine NotAuthorized
 * @apiError NotAuthorized The requester is not authorized to access this endpoint
 * @apiErrorExample NotAuthorized Response:
 *     HTTP/1.1 401 Not Authorized
 *     {
 *       "error":{
 *         "code":401,
 *         "message":"Not authorized"
 *       }
 *     }
 */

/**
 * @apiDefine admin AdminUser
 * A logged in user
 */

/**
 * @apiDefine none public
 * This api endpoint is public
 */

/**
 * @apiDefine InvalidRequest
 * @apiError InvalidRequest The request is malformed
 * @apiErrorExample InvalidRequest Response:
 *     HTTP/1.1 400 Invalid Request
 *     {
 *       "error":{
 *         "code":400,
 *         "message":"Bad Request"
 *       }
 *     }
 */

/**
 * @apiDefine ErrorNotFound
 * @apiError NotFound The requested resource is unknown to the server
 * @apiErrorExample NotFound Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error":{
 *         "code":404,
 *         "message":"Not found"
 *       }
 *     }
 */

/**
 * The router for the api endpoints
 * @exports apiRouter
 */
var router = express.Router();

const supportedDataQueries = {
    "summary": {
        "authRequired": false
    },
    "overTimeData": {
        "authRequired": false
    },
    "topItems": {
        "authRequired": true
    },
    "recentItems": {
        "authRequired": true
    },
    "queryTypes": {
        "authRequired": true
    },
    "forwardDestinations": {
        "authRequired": true
    },
    "allQueries": {
        "authRequired": true
    },
    "querySources": {
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
            console.log("authentication failed: " + req.method + "(" + req.originalUrl + ")");
            res.status(401);
            res.json({
                "error": {
                    "code": 401,
                    "message": "Not authenticated"
                }
            });
        }
    }
};
// Potential buildfail fix for below node 5 
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

router.use(function(req, res, next) {
    res.setHeader("Content-Type", "application/json");
    next();
});

/**
 * @api {get} /api/data/queryTypes Get Querytypes
 * @apiName GetDataQueryTypes
 * @apiGroup Data
 * @apiVersion 1.0.1
 * @apiPermission admin
 *
 * @apiSuccess {Object[]} queryTypes Array with query types
 * @apiSuccess {String} queryTypes.type query type
 * @apiSuccess {Number} queryTypes.count number of queries with this type
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "queryTypes":[
 *         {
 *           "type": "AAAA",
 *           "count": 299
 *         },
 *         {
 *           "type": "AA",
 *           "count": 100
 *         }
 *       ]
 *     }
 * @apiUse InvalidRequest
 * @apiUse NotAuthorized
 */
router.get("/data/queryTypes", function(req, res, next) {
    var resp = {};
    var stream = logHelper.createLogParser()
        .pipe(logHelper.createQueryTypesSpy(resp))
        .on("end", function() {
            res.json(resp);
        })
        .on("error", function(error) {
            next(new Error("Error while parsing the log"));
        })
        .resume();
});
/**
 * @api {get} /api/data/querySources Get query sources
 * @apiName GetDataQuerySources
 * @apiGroup Data
 * @apiVersion 1.0.1
 * @apiPermission admin
 *
 * @apiSuccess {Object[]} querySources Array with query sources
 * @apiSuccess {String} querySource.ip source ip
 * @apiSuccess {String} [querySource.domain] source domain if known
 * @apiSuccess {Number} querySource.count number of queries from this source
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "querySources":[
 *         {
 *           "ip": "127.0.0.1",
 *           "domain": "localhost",
 *           "count":20
 *         },
 *         {
 *           "ip": "192.168.178.1",
 *           "count":29
 *         }
 *       ]
 *     }
 * @apiUse InvalidRequest
 * @apiUse NotAuthorized
 */
router.get("/data/querySources", function(req, res, next) {
    var resp = {};
    var stream = logHelper.createLogParser()
        .pipe(logHelper.createQuerySourcesSpy(resp))
        .on("end", function() {
            res.json({
                "data": resp
            });
        })
        .on("error", function(error) {
            next(new Error("Error while parsing the log"));
        })
        .resume();
});
/**
 * @api {get} /api/data/overtimeData Get OverTimeData
 * @apiName GetDataOverTimeData
 * @apiGroup Data
 * @apiVersion 1.0.1
 * @apiPermission admin
 * @apiParam (Query Parameter) {Number=1,10,60} [frameSize=10] Sets the overtime timeframe size in minutes
 *
 * @apiSuccess {Object[]} overTimeData Array with query data
 * @apiSuccess {Number{0-..}} overTimeData.ads number of ads in that timeframe
 * @apiSuccess {Number} overTimeData.queries number of queries in that timeframe
 * @apiSuccess {Number} overTimeData.frame the frame number
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "overTimeData":[
 *         {
 *           "ads":20,
 *           "queries":200,
 *           "frame":0
 *         },
 *         {
 *           "ads":20,
 *           "queries":200,
 *           "frame":1
 *         },
 *         {
 *           "ads":20,
 *           "queries":200,
 *           "frame":2
 *         }
 *       ]
 *     }
 * @apiUse InvalidRequest
 * @apiUse NotAuthorized
 */
router.get("/data/overtimeData", function(req, res, next) {
    var resp = {};
    var stream = logHelper.createLogParser()
        .pipe(logHelper.createOverTimeDataSpy(resp))
        .on("end", function() {
            res.json({
                "data": resp
            });
        })
        .on("error", function(error) {
            next(new Error("Error while parsing the log"));
        })
        .resume();
});
/**
 * @api {get} /api/data/topItems Get topItems
 * @apiName GetDataTopItems
 * @apiGroup Data
 * @apiVersion 1.0.1
 * @apiPermission admin
 *
 * @apiSuccess {Object} topItems Array with query data
 * @apiSuccess {Object} overTimeData.topQueries number of ads in that timeframe
 * @apiSuccess {Object} overTimeData.topAds number of queries in that timeframe
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "topItems":{
 *         "topQueries":{
 *           "good.domain1":29,
 *           "good.domain2":39,
 *         },
 *         "topAds":{
 *           "baddomain1":29,
 *           "baddomain2":39,
 *         }
 *       }
 *     }
 * @apiUse InvalidRequest
 * @apiUse NotAuthorized
 */
router.get("/data/topItems", function(req, res) {
    // Filter query types so only valid ones pass
    var args = {};
    // to cancel request early if no valid args were provided
    var numValidArgs = 0;
    for (var query in req.query) {
        // type check so someone can't query for example .toString()
        if (query in supportedDataQueries && (typeof supportedDataQueries[query].authRequired === "boolean")) {
            if (supportedDataQueries[query].authRequired && !req.user.authenticated) {
                // User needs to be authenticated for this query
                console.log("User is not authenticated for: " + req.method + "(" + req.originalUrl + ")");
                res.status(401);
                res.json({
                    "error": {
                        "code": 401,
                        "message": "Not authenticated"
                    }
                });
                return;
            }
            args[query] = true;
            numValidArgs++;
        }
    }
    // cancel request because no valid args were provided
    if (numValidArgs === 0) {
        console.log("No valid argument specified");
        res.sendStatus(400);
        return;
    }
    // Sanitize eventual frameSize query parameter
    if (req.query.frameSize && !isNaN(parseInt(req.query.frameSize))) {
        args.frameSize = parseInt(req.query.frameSize);
    }
    var prom = logHelper.createDataCombiner(appDefaults.logFile, args);
    prom.then(function(data) {
            res.json(data);
        })
        .catch(function(err) {
            console.error(err);
            res.sendStatus(500);
        });
});

/**
 * @api {get} /api/data/summary Get Summary
 * @apiName GetDataSummary
 * @apiGroup Data
 * @apiVersion 1.0.1
 * @apiPermission none
 *
 * @apiSuccess {Object} summary The object summary
 * @apiSuccess {Number} summary.adsBlockedToday Total blocked queries
 * @apiSuccess {Number} summary.dnsQueriesToday Total dns queries
 * @apiSuccess {Number} summary.adsPercentageToday Percentage of blocked requests
 * @apiSuccess {Number} summary.domainsBeingBlocked Domains being blocked in total
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "data":{
 *         "adsBlockedToday": 10,
 *         "dnsQueriesToday": 100,
 *         "domainsBeingBlocked": 1337
 *       }
 *     }
 * @apiUse InvalidRequest
 * @apiUse NotAuthorized
 */
router.get("/data/summary", function(req, res, next) {
    var resp = {
        "adsBlockedToday": 0,
        "dnsQueriesToday": 0
    };
    var stream = logHelper.createLogParser()
        .pipe(logHelper.createSummarySpy(resp))
        .on("end", function() {
            res.json({
                "data": resp
            });
        })
        .on("error", function(error) {
            next(new Error("Error while parsing the log"));
        })
        .resume();
});
/**
 * @api {get} /api/data/forwardDestinations Get forward Destinations
 * @apiName GetDataForwardDestinations
 * @apiGroup Data
 * @apiVersion 1.0.1
 * @apiPermission admin
 *
 * @apiSuccess {Object[]} forwardDestinations Array with query sources
 * @apiSuccess {String} forwardDestinations.destination name of destination
 * @apiSuccess {Number} forwardDestinations.count number of queries to this destination
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "forwardDestinations":[
 *         {
 *           "destination": "8.8.8.8",
 *           "count":20
 *         },
 *         {
 *           "destination": "8.8.4.4",
 *           "count":29
 *         }
 *       ]
 *     }
 * @apiUse InvalidRequest
 * @apiUse NotAuthorized
 */
router.get("/data/forwardDestinations", function(req, res, next) {
    const type = req.params.type;
    if (type && (type === "query" || type === "forward" || type === "block")) {
        var first = true;
        var stream = logHelper.createLogParser()
            .pipe(through2.obj(function(chunk, enc, callback) {
                if (chunk !== false && chunk.type == type) {
                    if (first) {
                        this.push("{\"data\":[");
                        first = false;
                    } else if (!first && chunk !== null) {
                        this.push(",");
                    }
                    this.push(JSON.stringify(chunk));
                }
                callback();
            }, function(callback) {
                this.push("]}");
                callback();
            }))
            .pipe(res);
    } else {
        next(new Error("Unsupported '" + req.params.type + "' type"));
    }
});
/**
 * @api {get} /log?type=... Get Log
 * @apiName GetLog
 * @apiGroup Log
 * @apiVersion 1.0.1
 * @apiPermission admin
 * @apiParam (Query Parameter) {String=all,query,forward,block} type=all gets all queries with the specified type
 *
 * @apiSuccess {Object} data Array with query data
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "data":[{
 *           "domain":"domain1.com",
 *           "timestamp":"2017-01-09T23:00:26.000Z",
 *           "client":"127.0.0.1",
 *           "type":"query",
 *           "queryType":"A"
 *         }
 *       ]
 *     }
 * @apiUse InvalidRequest
 * @apiUse NotAuthorized
 */
router.get("/log", function(req, res, next) {
    const type = req.query.type || "all";
    if (type && (type === "query" || type === "forward" || type === "block")) {
        var first = true;
        var stream = logHelper.createLogParser()
            .pipe(through2.obj(function(chunk, enc, callback) {
                if (chunk !== false && chunk.type == type) {
                    if (first) {
                        this.push("{\"data\":[");
                        first = false;
                    } else if (!first && chunk !== null) {
                        this.push(",");
                    }
                    this.push(JSON.stringify(chunk));
                }
                callback();
            }, function(callback) {
                this.push("]}");
                callback();
            }))
            .pipe(res);
    } else {
        next(new Error("Unsupported '" + req.params.type + "' type"));
    }
});

/**
 * @api {get} /log/live Opens an eventsource stream that tails the log file
 * @apiName GetLogLive
 * @apiGroup Log
 * @apiVersion 1.0.1
 * @apiPermission admin
 * @apiUse NotAuthorized
 */
router.get("/log/live",
    apiMiddleware.auth,
    function(req, res) {
        var connectionOpen = true;
        var updateInterval;
        req.on("close", function() {
            if (connectionOpen) {
                connectionOpen = false;
                clearInterval(updateInterval);
            }
        });

        req.on("end", function() {
            if (connectionOpen) {
                connectionOpen = false;
                clearInterval(updateInterval);
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
    }
);

/**
 * @api {get} /api/list/ Gets the white/black list
 * @apiName GetDomains
 * @apiGroup Lists
 * @apiVersion 1.0.0
 * @apiPermission admin
 * @apiParam (Query Parameter) {string="white","black"} The list name
 * @apiError NotFound The <code>list</code> is unknown to the server
 * @apiUse NotAuthorized
 * @apiUse InvalidRequest
 * @apiUse ErrorNotFound
 */
router.get("/list", apiMiddleware.auth, function(req, res) {
    if ("list" in req.query && (req.query.list === "white" || req.query.list === "black")) {
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

/**
 * @api {post} /api/list/ Adds a domain to the specified list
 * @apiName AddDomain
 * @apiGroup Lists
 * @apiVersion 1.0.0
 * @apiPermission admin
 * @apiParam (Query Parameter) {string="white","black"} The list name
 * @apiError NotFound The <code>list</code> is unknown to the server
 * @apiUse NotAuthorized
 * @apiUse InvalidRequest
 * @apiUse ErrorNotFound
 */
router.post("/list",
    apiMiddleware.auth,
    helper.express.csrfMiddleware,
    function(req, res) {
        var domain = req.body.domain;
        var list = req.body.list;
        if (domain && list) {
            if (list === "white") {
                childProcess.exec("sudo pihole -w -q " + domain);
                res.end();
            } else if (list === "black") {
                childProcess.exec("sudo pihole -b -q " + domain);
                res.end();
            } else {
                res.sendStatus(401);
            }
        } else {
            res.sendStatus(404);
        }
    }
);

/**
 * @api {delete} /api/list/ Deletes a domain from the specified list
 * @apiName DeleteDomain
 * @apiGroup Lists
 * @apiVersion 1.0.0
 * @apiPermission admin
 * @apiParam (Query Parameter) {string="white","black"} The list name
 * @apiError NotFound The <code>list</code> is unknown to the server
 * @apiUse NotAuthorized
 * @apiUse InvalidRequest
 * @apiUse ErrorNotFound
 */
router.delete("/list",
    apiMiddleware.auth,
    helper.express.csrfMiddleware,
    function(req, res) {
        var domain = req.body.domain;
        var list = req.body.list;
        if (domain && list) {
            if (list === "white") {
                childProcess.exec("sudo pihole -w -q -d " + domain);
                res.end();
            } else if (list === "black") {
                childProcess.exec("sudo pihole -b -q -d " + domain);
                res.end();
            } else {
                res.sendStatus(401);
            }
        } else {
            res.sendStatus(404);
        }
    }
);

/**
 * @api {post} /api/enable/ Enable Pihole
 * @apiName Enables the Pi Hole
 * @apiGroup Status
 * @apiVersion 1.0.0
 * @apiPermission admin
 * @apiSuccess {String} status the status of the pihole
 * @apiUse InvalidRequest
 * @apiUse NotAuthorized
 */
router.post("/enable",
    apiMiddleware.auth,
    helper.express.csrfMiddleware,
    function(req, res) {
        childProcess.exec("sudo pihole enable", function(error, stdout, stderr) {
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

/**
 * @api {post} /api/disable/ Disable Pihole
 * @apiName Disables the Pi Hole
 * @apiGroup Status
 * @apiVersion 1.0.0
 * @apiPermission admin
 * @apiParam (Body) {Number} time a positive number in seconds for how long to disable the pihole. 0 disables indefinitely
 * @apiSuccess {String} status the status of the pihole
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "disabled"
 *     }
 * @apiUse InvalidRequest
 * @apiUse NotAuthorized
 */
router.post("/disable",
    apiMiddleware.auth,
    helper.express.csrfMiddleware,
    function(req, res) {
        if (req.body.time && !isNaN(req.body.time)) {
            var disableTime = Math.floor(Number(req.body.time));
            childProcess.exec("sudo pihole disable" + (disableTime > 0 ? " " + disableTime + "s" : ""), function(error, stdout, stderr) {
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

/**
 * @api {post} /api/status/ Gets the status of the pihole
 * @apiName Get Pihole Status
 * @apiGroup Status
 * @apiVersion 1.0.0
 * @apiPermission admin
 * @apiSuccess {String} temperature Temperature of the pi or false if couldn't be retrieved
 * @apiSuccess {String} status Status of the pi or false if couldn't be retrieved
 * @apiSuccess {Number} memory Memory usage in percent of the pi or false if couldn't be retrieved
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "temperature": "21.32",
 *       "memory": 0.242,
 *       "status":"active"
 *     }
 * @apiUse InvalidRequest
 * @apiUse NotAuthorized
 */
router.get("/status",
    apiMiddleware.auth,
    function(req, res) {
        Promise.all([helper.getTemperature(), helper.getPiholeStatus(), helper.getFreeMemory()])
            .then(function(data) {
                res.json({
                    "temperature": data[0],
                    "status": data[1],
                    "memory": data[2]
                });
            })
            .catch(function(err) {
                res.sendStatus(500);
            });
    }
);

module.exports = router;
