const express = require("express");
const readline = require("readline");
const moment = require("moment");
const fs = require("fs");
const logHelper = require("./../logHelper.js");
const appDefaults = require("./../defaults.js");
var router = express.Router();

const supportedDataQueries = ["summary", "summaryRaw", "overTimeData", "overTimeData10mins", "topItems", "recentItems", "getQueryTypes", "getForwardDestinations"];

router.get("/data", function(req, res) {
    // Filter query types so only valid ones pass
    var args = {};
    // to cancel request early if no valid args were provided
    var numValidArgs = 0;
    for (var query in req.query) {
        if (supportedDataQueries.includes(query)) {
            args[query] = req.query[query];
            numValidArgs++;
        }
    }
    // cancel request because no valid args were provided
    if (numValidArgs == 0) {
        res.sendStatus(400);
        return;
    }

    var data = {};
    var promises = [];
    if ("summary" in args) {
        promises.push(logHelper.getSummary());
    }
    if ("summaryRaw" in args) {
        promises.push(logHelper.getSummaryRaw());
    }
    if ("overTimeData" in req.query) {}
    if ("overTimeData10mins" in req.query) {
        promises.push(logHelper.getOverTimeData10mins());
    }
    if ("topItems" in req.query) {
        promises.push(logHelper.getTopItems());
    }
    if ("recentItems" in req.query) {}
    if ("getQueryTypes" in req.query) {
        promises.push(logHelper.getQueryTypes());
    }
    if ("getForwardDestinations" in req.query) {
        promises.push(logHelper.getForwardDestinations());
    }
    if ("getQuerySources" in req.query) {}
    if ("getAllQueries" in req.query) {
        var lineReader = require("readline")
            .createInterface({
                input: require("fs")
                    .createReadStream(appDefaults.logFile)
            });
        var lines = [];
        lineReader.on("line", function(line) {
            if (typeof line === "undefined" || line.trim() === "" || line.indexOf(": query[A") === -1) {
                return;
            } else {
                var _time = line.substring(0, 16);
                var expl = line.trim()
                    .split(" ");
                var _domain = expl[expl.length - 3];
                var tmp = expl[expl.length - 4];
                var _status = Math.random() < 0.5 ? "Pi-holed" : "OK";
                var _type = tmp.substring(6, tmp.length - 1);
                var _client = expl[expl.length - 1];
                var data = {
                    time: moment(_time, "MMM DD hh:mm:ss")
                        .toISOString(),
                    domain: _domain,
                    status: _status,
                    type: _type,
                    client: _client
                };
                lines.push(data);
            }
        });
        lineReader.on("close", function() {
            res.json({
                data: lines
            });
        });
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

module.exports = router;
