const appDefaults = require("./defaults.js");
const fs = require("fs");
const moment = require("moment");
const os = require("os");
const exec = require("child_process")
    .exec;
const readline = require("readline");
const setupVars = require("./setupVars.js");
const dns = require("dns");

const isWin = /^win/.test(os.platform());

/**
 * @exports logHelper
 */
var logHelper = {

};

/**
 * Parses the provided line
 * @type {Function}
 * @param {String} line to parse
 * @returns {Object|Boolean} the parsed line or false if not recognized
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
    } else {
        return false;
    }
};

/** 
 * Creates a new Summary Object
 * @class 
 */
var Summary = function() {
    /** 
     *  ads blocked total
     *@member {Number}
     */
    this.adsBlockedToday = 0;
    /** 
     *  dns queries total
     *@member {Number}
     */
    this.dnsQueriesToday = 0;
    /** 
     *  ads percentage
     *@member {Number}
     */
    this.adsPercentageToday = 0;
    /** 
     * dns being blocked in total
     * @member {Number}
     */
    this.domainsBeingBlocked = 0;
};

/**
 *  @typedef Summary2
 *  @type {object}
 *  @property {number} adsBlockedToday - Total blocked queries
 *  @property {number} dnsQueriesToday - Total dns queries
 *  @property {number} adsPercentageToday - Percentage of blocked requests
 *  @property {number} domainsBeingBlocked - Domains being blocked in total
 */

/**
 * Creates a summary of the log file
 * @returns {Promise} a Promise providing a {@link Summary2} of the log file
 */
logHelper.getSummary = function() {
    return new Promise(function(resolve, reject) {
            var lineReader = readline
                .createInterface({
                    input: require("fs")
                        .createReadStream(appDefaults.logFile)
                });
            var summaryData = {
                ads_blocked_today: 0,
                dns_queries_today: 0,
                ads_percentage_today: 0,
                domains_being_blocked: 0
            };
            lineReader.on("line", function(line) {
                var lineData = logHelper.parseLine(line);
                if (lineData === false) {
                    return;
                }
                if (lineData.type === "query") {
                    summaryData.dns_queries_today++;
                } else if (lineData.type === "block") {
                    summaryData.ads_blocked_today++;
                }
            });
            lineReader.on("close", function() {
                summaryData.ads_percentage_today = (summaryData.dns_queries_today === 0) ? 0 : (summaryData.ads_blocked_today / summaryData.dns_queries_today) * 100;
                resolve(summaryData);
            });
        })
        .then(function(result) {
            return new Promise(function(resolve, reject) {
                logHelper.getGravityCount()
                    .then(function(result2) {
                        result.domains_being_blocked = result2;
                        resolve(result);
                    })
                    .catch(function(err) {
                        reject(err);
                    });
            });
        });
};

/**
 * Auxilary function for windows to count non empty lines in a file
 * @param {String} filename to count the lines in
 * @param {logHelper~lineNumberCallback} callback - callback for the result
 */
logHelper.getFileLineCountWindows = function(filename, callback) {
    exec("find /c /v \"\" \"" + filename + "\"", function(err, stdout, stderr) {
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
 * This callback is displayed as part of the Requester class.
 * @callback logHelper~lineNumberCallback
 * @param {Number} Line count
 */

/**
 * Auxilary function for *nix to count non empty lines in a file
 * @param {String} filename to count the lines in
 * @param {logHelper~lineNumberCallback} callback - callback for the result
 */
logHelper.getFileLineCountUnix = function(filename, callback) {
    exec("grep -c ^ " + filename, function(err, stdout, stderr) {
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
            resolve({
                "data": lines
            });
        });
    });
};

/**
 * Counts the Query types
 * @returns {Promise} a Promise providing the number queries for each type
 */
logHelper.getQueryTypes = function() {
    return new Promise(function(resolve, reject) {
        fs.access(appDefaults.logFile, fs.F_OK | fs.R_OK, function(err) {
            if (err) {
                reject(err);
            } else {
                var queryTypes = {};
                var lineReader = readline
                    .createInterface({
                        input: require("fs")
                            .createReadStream(appDefaults.logFile)
                    });
                lineReader.on("line", function(line) {
                    if (typeof line === "undefined" || line.trim() === "" || line.indexOf(": query[A") === -1) {
                        return;
                    }
                    var info = line.split(": ")[1].trim();
                    var queryType = info.split(" ")[0];
                    if (queryType in queryTypes) {
                        queryTypes[queryType]++;
                    } else {
                        queryTypes[queryType] = 1;
                    }
                });
                lineReader.on("close", function() {
                    resolve(queryTypes);
                });
            }
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
 * @param {String} ip - ip to check
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
            var lineReader = readline
                .createInterface({
                    input: require("fs")
                        .createReadStream(appDefaults.logFile)
                });
            var clients = {};
            lineReader.on("line", function(line) {
                var lineData = logHelper.parseLine(line);
                if (lineData === false || lineData.type !== "query") {
                    return;
                }
                if (clients.hasOwnProperty(lineData.client)) {
                    clients[lineData.client]++;
                } else {
                    clients[lineData.client] = 1;
                }
            });
            lineReader.on("close", function() {
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
        })
        .then(function(clients) {
            return {
                "topSources": clients
            };
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
                var lineReader = readline
                    .createInterface({
                        input: require("fs")
                            .createReadStream(appDefaults.logFile)
                    });
                lineReader.on("line", function(line) {
                    if (typeof line === "undefined" || line.trim() === "" || line.indexOf(": forwarded") === -1) {
                        return;
                    }
                    var info = line.trim()
                        .split(" ");
                    var destination = info[info.length - 1];
                    if (destination in destinations) {
                        destinations[destination]++;
                    } else {
                        destinations[destination] = 1;
                    }
                });
                lineReader.on("close", function() {
                    resolve(destinations);
                });
            }
        });
    });
};

/**
 * Gets the number of queries divided into 10 minute timeframes
 * @returns {Promise} a Promise returning a object containing information about ads and domains over time
 */
logHelper.getOverTimeData10mins = function() {
    return new Promise(function(resolve, reject) {
        var lineReader = readline
            .createInterface({
                input: require("fs")
                    .createReadStream(appDefaults.logFile)
            });
        var data = {
            domains_over_time: {},
            ads_over_time: {}
        };
        lineReader.on("line", function(line) {
            if (typeof line === "undefined" || line.trim() === "" || line.indexOf(": query[A") === -1) {
                return;
            }
            var time = moment(line.substring(0, 16), "MMM DD hh:mm:ss");
            var hour = time.hour();
            var minute = time.minute();
            time = (minute - minute % 10) / 10 + 6 * hour;
            if (Math.random() < 0.5) {
                if (time in data.ads_over_time) {
                    data.ads_over_time[time]++;
                } else {
                    data.ads_over_time[time] = 1;
                }
            }
            if (time in data.domains_over_time) {
                data.domains_over_time[time]++;
            } else {
                data.domains_over_time[time] = 1;
            }
        });
        lineReader.on("close", function() {
            resolve(data);
        });
    });
};

logHelper.getTopItems = function(argument) {
    return logHelper.getGravity()
        .then(function(gravityList) {
            return new Promise(function(resolve, reject) {
                fs.access(appDefaults.logFile, fs.F_OK | fs.R_OK, function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        var topDomains = {},
                            topAds = {};
                        var lineReader = readline
                            .createInterface({
                                input: require("fs")
                                    .createReadStream(appDefaults.logFile)
                            });
                        lineReader.on("line", function(line) {
                            var info = logHelper.parseLine(line);
                            if (info !== false && info.type === "query") {
                                if (info.domain in gravityList) {
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
                        lineReader.on("close", function() {
                            resolve({
                                "topQueries": topDomains,
                                "topAds": topAds
                            });
                        });
                    }
                });
            });
        });
};

module.exports = logHelper;
