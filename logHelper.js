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

var logHelper = {

};

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

logHelper.getFileLineCountUnix = function(filename, callback) {
    exec("grep -c ^ " + filename, function(err, stdout, stderr) {
        if (err || stderr !== "") {
            callback(0);
        } else {
            callback(parseInt(stdout));
        }
    });
};

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
            console.log("B", source.splice(idx, 1));
        }
    }
    return source;
};

function resolveIP(ip) {
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

function resolveIPs(ips) {
    dns.reverse
    var queries = [];
    for (var ip in ips) {
        queries.push(resolveIP(ip, ips[ip]));
    }
    return Promise.all(queries)
        .then(function(results) {
            var domains = {};
            for (var i = 0; i < results.length; i++) {
                domain[results[i]] = ips[i];
            }
            return domain;
        });
};

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
                    if (typeof line === "undefined" || line.trim() === "" || line.indexOf(": query[A") === -1) {
                        return;
                    }
                    var info = line.split(" ");
                    var domain = info[info.length - 3].trim();
                    if (topDomains.hasOwnProperty(domain)) {
                        topDomains[domain]++;
                    } else {
                        topDomains[domain] = 1;
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
};

module.exports = logHelper;
