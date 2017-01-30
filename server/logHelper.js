const appDefaults = require("./defaults.js");
const fs = require("fs");
const moment = require("moment");
const os = require("os");
const childProcess = require("child_process");
const readline = require("readline");
const setupVars = require("./setupVars.js");
const dns = require("dns");
const EventEmitter = require("events")
    .EventEmitter;
const split2 = require("split2");
const through2 = require("through2");
const through2Spy = require("through2-spy");

const isWin = /^win/.test(os.platform());

/**
 * @exports logHelper
 */
var logHelper = {};

/**
 * Object containing information about the summary
 *  @typedef Query
 *  @type {object}
 *  @property {String} timestamp - Iso Timestamp of the query
 *  @property {String} type - always "query"
 *  @property {String} domain - The queried domain
 *  @property {String} client - The client that issued the query
 *  @property {String} queryType - e.g. AA or AAAA
 */

/**
 * Object containing information about the summary
 *  @typedef Block
 *  @type {object}
 *  @property {String} timestamp - Iso Timestamp of the block
 *  @property {String} type - always "block"
 *  @property {String} domain - The blocked domain
 *  @property {String} list - the list that blocked the domain
 */

/**
 * Parses the provided line
 * @type {Function}
 * @param {String} line to parse
 * @returns {module:logHelper~Query|module:logHelper~Block|Boolean} the parsed line or false if not recognized
 */
logHelper.parseLine = function(line) {
    if (typeof line === "undefined" || line.trim() === "") {
        return false;
    }
    var time = line.substring(0, 16);
    time = moment(time, "MMM DD hh:mm:ss")
        .toISOString();
    var infoStart = line.indexOf(": ");
    if (infoStart < 0) {
        return false;
    }
    var info = line.substring(infoStart + 2)
        .replace(/\s{2,}/g, " ")
        .trim();
    var split = info.split(" ");
    if (info.startsWith("query[")) {
        var domain = split[1];
        var type = split[0].substring(6, split[0].length - 1);
        var client = split[3];
        return {
            "domain": domain,
            "timestamp": time,
            "client": client,
            "type": "query",
            "queryType": type
        };
    } else if (split.length === 4 && split[0].match(/^(.*\/)gravity\.list$/)) {
        return {
            "domain": split[1],
            "type": "block",
            "timestamp": time,
            "list": split[0]
        };
    } else if (split.length === 6 && split[2].match(/^(.*\/)gravity\.list$/)) {
        return {
            "domain": split[3],
            "type": "block",
            "timestamp": time,
            "list": split[2]
        };
    } else if (info.startsWith("forwarded ")) {
        return {
            "timestamp": time,
            "domain": split[1],
            "destination": split[3],
            "type": "forward"
        };
    } else {
        return false;
    }
};

/**
 * Object containing information about the summary
 *  @typedef Summary
 *  @type {object}
 *  @property {number} adsBlockedToday - Total blocked queries
 *  @property {number} dnsQueriesToday - Total dns queries
 *  @property {number} adsPercentageToday - Percentage of blocked requests
 *  @property {number} domainsBeingBlocked - Domains being blocked in total
 */

/**
 * Auxilary function for windows to count non empty lines in a file
 * @param {String} filename to count the lines in
 * @param {module:logHelper~lineNumberCallback} callback - callback for the result
 */
logHelper.getFileLineCountWindows = function(filename, callback) {
    childProcess.exec("find /c /v \"\" \"" + filename + "\"", function(err, stdout, stderr) {
        if (err || stderr !== "") {
            callback(0);
        } else {
            var res = stdout.match(/[0-9]+(?=[\s\r\n]*$)/);
            if (res) {
                callback(parseInt(res[0]));
            } else {
                callback(0);
            }
        }
    });
};

/**
 * Auxilary function for *nix to count non empty lines in a file
 * @param {String} filename to count the lines in
 * @param {module:logHelper~lineNumberCallback} callback - callback for the result
 */
logHelper.getFileLineCountUnix = function(filename, callback) {
    childProcess.exec("grep -c ^ " + filename, function(err, stdout, stderr) {
        if (err || stderr !== "") {
            callback(0);
        } else {
            callback(parseInt(stdout));
        }
    });
};

/**
 * Counts non empty lines in a file
 * @param {String} filename to count the lines in
 * @returns {Promise} a Promise providing the line count
 */
logHelper.getFileLineCount = function(filename) {
    return new Promise(function(resolve, reject) {
        fs.access(filename, fs.F_OK | fs.R_OK, function(err) {
            if (err) {
                // if the file does not exist or is not readable return 0
                resolve(0);
            } else {
                if (isWin) {
                    logHelper.getFileLineCountWindows(filename, function(result) {
                        resolve(result);
                    });
                } else {
                    logHelper.getFileLineCountUnix(filename, function(result) {
                        resolve(result);
                    });
                }
            }
        });
    });
};
logHelper.createLogParser = function(filename) {
    return fs
        .createReadStream(filename)
        .pipe(split2())
        .pipe(through2.obj(function(chunk, enc, callback) {
            this.push(logHelper.parseLine(chunk));
            callback();
        }));
};

logHelper.loadDomainFile = function(filename, blacklist) {
    return new Promise(function(resolve, reject) {
            var domainList = [];
            let errorHandler = function(err) {
                reject(err);
            };
            const stream = fs
                .createReadStream(filename)
                // pipe doesn't pass through errors........
                .on("error", errorHandler)
                .pipe(split2())
                .pipe(through2Spy.obj(function(data) {
                    if (data.trim() !== "") {
                        var inBlacklist = (typeof blacklist !== "undefined" && blacklist.indexOf(data) !== -1);
                        if (domainList.indexOf(data) === -1 && !inBlacklist) {
                            domainList.push(data);
                        }
                    }
                }))
                .on("error", errorHandler)
                .on("end", function() {
                    resolve(domainList);
                })
                .resume();
        })
        .catch(function(err) {
            return [];
        });
};

logHelper.getGravity = function() {
    return logHelper.loadDomainFile(appDefaults.whiteListFile)
        .then(function(whitelist) {
            return Promise
                .all([logHelper.loadDomainFile(appDefaults.blackListFile, whitelist),
                    logHelper.loadDomainFile(appDefaults.gravityListFile, whitelist)
                ]);
        })
        .then(function(lists) {
            if (lists.length === 1) {
                return lists[0];
            } else {
                var l1 = lists[0];
                for (var i = 1; i < lists.length; i++) {
                    for (var j = 0; j < lists[i].length; j++) {
                        if (l1.indexOf(lists[i][j]) === -1) {
                            l1.push(lists[i][j]);
                        }
                    }
                }
                return l1;
            }
        })
        .catch(function(error) {
            return [];
        });
};

logHelper.createDataCombiner = function(logFile, options) {
    if (typeof options === "undefined" || Object.keys(options)
        .length === 0) {
        throw new Error("No options provided");
    }
    var prom;
    if (options.topItems === true) {
        prom = logHelper.getGravity();
    } else {
        prom = Promise.resolve([]);
    }
    prom = prom
        .then(function(gravityList) {
            return new Promise(function(resolve, reject) {
                var result = {};
                var logParser = logHelper.createLogParser(logFile);
                if (options.summary === true) {
                    result.summary = {
                        adsBlockedToday: 0,
                        dnsQueriesToday: 0,
                        adsPercentageToday: 0,
                        domainsBeingBlocked: 0
                    };
                    var summarySpy = through2Spy.obj(function(chunk) {
                        if (chunk !== false && chunk.type === "query") {
                            result.summary.dnsQueriesToday++;
                        } else if (chunk !== false && chunk.type === "block") {
                            result.summary.adsBlockedToday++;
                        }
                    });
                    logParser = logParser.pipe(summarySpy);
                }
                if (options.queryTypes === true) {
                    result.queryTypes = {};
                    var queryTypesSpy = through2Spy.obj(function(chunk) {
                        if (chunk === false || chunk.type !== "query") {
                            return;
                        } else if (result.queryTypes.hasOwnProperty(chunk.queryType)) {
                            result.queryTypes[chunk.queryType]++;
                        } else {
                            result.queryTypes[chunk.queryType] = 1;
                        }
                    });
                    logParser = logParser.pipe(queryTypesSpy);
                }
                if (options.querySources === true) {
                    result.querySources = {};
                    var querySourcesSpy = through2Spy.obj(function(chunk) {
                        if (chunk === false || chunk.type !== "query") {
                            return;
                        } else if (result.querySources.hasOwnProperty(chunk.client)) {
                            result.querySources[chunk.client]++;
                        } else {
                            result.querySources[chunk.client] = 1;
                        }
                    });
                    logParser = logParser.pipe(querySourcesSpy);
                }
                if (options.forwardDestinations === true) {
                    result.forwardDestinations = {};
                    var forwardDestinationsSpy = through2Spy.obj(function(chunk) {
                        if (chunk === false || chunk.type !== "forward") {
                            return;
                        } else if (result.forwardDestinations.hasOwnProperty(chunk.destination)) {
                            result.forwardDestinations[chunk.destination]++;
                        } else {
                            result.forwardDestinations[chunk.destination] = 1;
                        }
                    });
                    logParser = logParser.pipe(forwardDestinationsSpy);
                }
                if (options.overTimeData === true) {
                    result.overTimeData = {
                        "ads": {},
                        "queries": {}
                    };
                    var overTimeDataSpy = through2Spy.obj(function(chunk) {
                        if (chunk !== false && (chunk.type === "block" || chunk.type === "query")) {
                            var timestamp = moment(chunk.timestamp);
                            var minute = timestamp.minute();
                            var hour = timestamp.hour();
                            var time = (minute - minute % 10) / 10 + 6 * hour;
                            const type = chunk.type === "block" ? "queries" : "ads";
                            if (result.overTimeData[type].hasOwnProperty(time)) {
                                result.overTimeData[type][time]++;
                            } else {
                                result.overTimeData[type][time] = 1;
                            }
                        }
                    });
                    logParser = logParser.pipe(overTimeDataSpy);
                }
                if (options.topItems === true) {
                    result.topItems = {
                        "topQueries": {},
                        "topAds": {}
                    };
                    var topItemsSpy = through2Spy.obj(function(chunk) {
                        if (chunk !== false && chunk.type === "query") {
                            var key = gravityList.indexOf(chunk.domain) !== -1 ? "topAds" : "topQueries";
                            if (result.topItems[key].hasOwnProperty(chunk.domain)) {
                                result.topItems[key][chunk.domain]++;
                            } else {
                                result.topItems[key][chunk.domain] = 1;
                            }
                        }
                    });
                    logParser = logParser.pipe(topItemsSpy);
                }
                logParser.on("data", function(data) {
                    //console.log("data");
                });

                logParser.on("end", function() {
                    resolve(result);
                });
            });
        })
        .then(function(data) {
            // AFTER DATA RETRIEVAL HOOK
            if (options.summary === true) {
                data.summary.adsPercentageToday = data.summary.dnsQueriesToday == 0 ? 0 : data.summary.adsBlockedToday / data.summary.dnsQueriesToday;
            }

            return data;
        });
    return prom;
};

logHelper.getTopItems = function(argument) {
    return logHelper.getGravity()
        .then(function(gravityList) {
            return new Promise(function(resolve, reject) {
                var parser = logHelper.createLogParser(appDefaults.logFile);
                var topDomains = {},
                    topAds = {};
                parser.on("data", function(info) {
                    if (info !== false && info.type === "query") {
                        if (gravityList.hasOwnProperty(info.domain)) {
                            if (topAds.hasOwnProperty(info.domain)) {
                                topAds[info.domain]++;
                            } else {
                                topAds[info.domain] = 1;
                            }
                        } else {
                            if (topDomains.hasOwnProperty(info.domain)) {
                                topDomains[info.domain]++;
                            } else {
                                topDomains[info.domain] = 1;
                            }
                        }
                    }
                });
                parser.on("end", function() {
                    resolve({
                        "topQueries": topDomains,
                        "topAds": topAds
                    });
                });
            });
        });
};

module.exports = logHelper;

/**
 * This callback is displayed as part of the Requester class.
 * @callback lineNumberCallback
 * @param {Number} count - Line number count
 */
