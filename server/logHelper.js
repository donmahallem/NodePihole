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
 * Creates a summary of the log file
 * @returns {Promise} a Promise providing a [Summary]{@link module:logHelper~Summary} of the log file
 */
logHelper.getSummary = function() {
    return new Promise(function(resolve, reject) {
            var lineReader = readline
                .createInterface({
                    input: require("fs")
                        .createReadStream(appDefaults.logFile)
                });
            var summaryData = {
                adsBlockedToday: 0,
                dnsQueriesToday: 0,
                adsPercentageToday: 0,
                domainsBeingBlocked: 0
            };
            lineReader.on("line", function(line) {
                var lineData = logHelper.parseLine(line);
                if (lineData === false) {
                    return;
                }
                if (lineData.type === "query") {
                    summaryData.dnsQueriesToday++;
                } else if (lineData.type === "block") {
                    summaryData.adsBlockedToday++;
                }
            });
            lineReader.on("close", function() {
                summaryData.adsPercentageToday = (summaryData.dnsQueriesToday === 0) ? 0 : (summaryData.adsBlockedToday / summaryData.dnsQueriesToday) * 100;
                resolve(summaryData);
            });
        })
        .then(function(result) {
            return new Promise(function(resolve, reject) {
                logHelper.getGravityCount()
                    .then(function(result2) {
                        result.domainsBeingBlocked = result2;
                        resolve(result);
                    })
            });
        });
};

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

/**
 * Counts the blocked domains
 * @returns {Promise} a Promise with the number of blocked domains
 */
logHelper.getGravityCount = function() {
    return Promise.all([logHelper.getFileLineCount(appDefaults.gravityListFile),
            logHelper.getFileLineCount(appDefaults.blackListFile)
        ])
        .then(function(results) {
            return results.reduce(function(a, b) {
                return a + b;
            }, 0);
        });
};

/**
 * Gets all domains listed in the specified file
 * @param {String} file to read
 * @returns {Promise} a Promise providing the line domains
 */
logHelper.getDomains = function(file) {
    return new Promise(function(resolve, reject) {
        fs.access(file, fs.F_OK | fs.R_OK, function(err) {
            if (err) {
                resolve([]);
            } else {
                var lineReader = require("readline")
                    .createInterface({
                        input: require("fs")
                            .createReadStream(file)
                    });
                var lines = [];
                lineReader.on("line", function(line) {
                    if (typeof line === "undefined" || line.trim() === "") {
                        return;
                    } else {
                        lines.push(line);
                    }
                });
                lineReader.on("close", function() {
                    resolve(lines);
                });
            }
        });
    });
};

/**
 * Merges all blacklist files and removes the whitelisted domains
 * @returns {Promise} a Promise providing blocked domains
 */
logHelper.getGravity = function() {
    return Promise.all([logHelper.getDomains(appDefaults.blackListFile),
            logHelper.getDomains(appDefaults.gravityListFile),
            logHelper.getDomains(appDefaults.whiteListFile)
        ])
        .then(function(values) {
            var domains = {};
            values[0].forEach(function(item) {
                domains[item] = true;
            });
            values[1].forEach(function(item) {
                domains[item] = true;
            });
            values[2].forEach(function(item) {
                if (domains.hasOwnProperty(item)) {
                    delete domains[item];
                }
            });
            return domains;
        });
};

/**
 * Returns all query entries from the log
 * @returns {Promise} a Promise providing all queries
 */
logHelper.getAllQueries = function() {
    return new Promise(function(resolve, reject) {
        var parser = logHelper.createLogParser(appDefaults.logFile);
        var data = [];
        parser.on("line", function(line) {
            data.push(line);
        });
        parser.on("close", function() {
            resolve(data);
        });
    });
};

/**
 * Counts the Query types
 * @returns {Promise} a Promise providing the number queries for each type
 */
logHelper.getQueryTypes = function() {
    return new Promise(function(resolve, reject) {
        var parser = logHelper.createLogParser(appDefaults.logFile);
        var queryTypes = {};
        parser.on("line", function(lineData) {
            if (lineData === false || lineData.type !== "query") {
                return;
            }
            if (queryTypes.hasOwnProperty(lineData.queryType)) {
                queryTypes[lineData.queryType]++;
            } else {
                queryTypes[lineData.queryType] = 1;
            }
        });
        parser.on("close", function() {
            resolve(queryTypes);
        });
    });
};

const excludeFromList = function(source, excl) {
    var idx;
    for (var i = 0; i < excl.length; i++) {
        idx = source.indexOf(excl[i]);
        if (idx !== -1) {
            source.splice(idx, 1);
        }
    }
    return source;
};

/**
 * Tries to resolve the domain of the ip
 * @method resolveIP
 * @param {String} ip - ip to check
 * @memberof logHelper
 * @private
 * @returns {Promise} a Promise either returning the ip or domains|ip
 */
const resolveIP = function(ip) {
    return new Promise(function(resolve, reject) {
        dns.reverse(ip, function(err, result) {
            if (err) {
                resolve(ip);
            } else {
                resolve(result.join(",") + "|" + ip);
            }
        });
    });
};

/**
 * Tries to resolve the domain of the ip
 * @method resolveIPs
 * @param {String[]} ips - ips to check
 * @memberof logHelper
 * @private
 * @returns {Promise} a Promise
 */
const resolveIPs = function(ips) {
    var queries = [];
    for (var ip in ips) {
        queries.push(resolveIP(ip, ips[ip]));
    }
    return Promise.all(queries)
        .then(function(results) {
            var domains = {};
            for (var i = 0; i < results.length; i++) {
                domains[results[i]] = ips[i];
            }
            return domains;
        });
};

/**
 * Gets the top clients of the pihole
 * @returns {Promise} a Promise returning all information
 */
logHelper.getQuerySources = function() {
    return new Promise(function(resolve, reject) {
            var parser = logHelper.createLogParser(appDefaults.logFile);
            var clients = {};
            parser.on("line", function(lineData) {
                if (lineData === false || lineData.type !== "query") {
                    return;
                }
                if (clients.hasOwnProperty(lineData.client)) {
                    clients[lineData.client]++;
                } else {
                    clients[lineData.client] = 1;
                }
            });
            parser.on("close", function() {
                resolve(clients);
            });
        })
        .then(function(clients) {
            if (setupVars["API_EXCLUDE_CLIENTS"]) {
                clients = excludeFromList(clients, setupVars["API_EXCLUDE_CLIENTS"]);
            }
            if (setupVars["API_GET_CLIENT_HOSTNAME"] === true) {
                return resolveIPs(clients);
            } else {
                return clients;
            }
        });
};

/**
 * Gets the forward destinations from the log file
 * @returns {Promise} a Promise providing the forward destinations
 */
logHelper.getForwardDestinations = function() {
    return new Promise(function(resolve, reject) {
        fs.access(appDefaults.logFile, fs.F_OK | fs.R_OK, function(err) {
            if (err) {
                reject(err);
            } else {
                var destinations = {};
                var parser = logHelper.createLogParser(appDefaults.logFile);
                parser.on("line", function(lineData) {
                    if (lineData === false || lineData.type !== "forward") {
                        return;
                    }
                    if (destinations.hasOwnProperty(lineData.destination)) {
                        destinations[lineData.destination]++;
                    } else {
                        destinations[lineData.destination] = 1;
                    }
                });
                parser.on("close", function() {
                    resolve(destinations);
                });
            }
        });
    });
};

logHelper.createLogParser = function(filename) {
    var self = this;
    self.emitter = new EventEmitter();
    var lineReader = readline
        .createInterface({
            input: fs
                .createReadStream(filename)
        });
    lineReader.on("line", function(line) {
        var info = logHelper.parseLine(line);
        if (info !== false) {
            self.emitter.emit("line", info);
        }
    });
    lineReader.on("close", function() {
        self.emitter.emit("close");
    });
    return self.emitter;
};

/**
 * Gets the number of queries divided into frameSize minute frames
 * @param {Number} frameSize - either 1, 10 or 60
 * @returns {Promise} a Promise returning a object containing information about ads and domains over time
 */
logHelper.getOverTimeData = function(frameSize) {
    // Check if frameSize is set. defaults to 10
    frameSize = (typeof frameSize !== 'undefined') ? frameSize : 10;
    return new Promise(function(resolve, reject) {
        var parser = logHelper.createLogParser(appDefaults.logFile);
        var data = {
            "queries": {},
            "ads": {}
        };
        parser.on("line", function(line) {
            var timestamp = moment(line.timestamp);
            var minute = timestamp.minute();
            var hour = timestamp.hour();
            var time = (minute - minute % 10) / 10 + 6 * hour;
            if (line.type === "block") {
                if (time in data.ads) {
                    data.ads[time]++;
                } else {
                    data.ads[time] = 1;
                }
            } else if (line.type === "query") {
                if (time in data.queries) {
                    data.queries[time]++;
                } else {
                    data.queries[time] = 1;
                }
            }
        });
        parser.on("close", function() {
            resolve(data);
        });
    });
};

logHelper.getTopItems = function(argument) {
    return logHelper.getGravity()
        .then(function(gravityList) {
            return new Promise(function(resolve, reject) {
                var parser = logHelper.createLogParser(appDefaults.logFile);
                var topDomains = {},
                    topAds = {};
                parser.on("line", function(info) {
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
                parser.on("close", function() {
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
