const appDefaults = require("./defaults.js");
const fs = require("fs");
const moment = require("moment");
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
        .replace(/ {2,}/g, " ")
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
        if (true) {
            resolve({
                ads_blocked_today: 10,
                dns_queries_today: 200,
                ads_percentage_today: 10.2,
                domains_being_blocked: 20
            });
        } else {
            reject(Error("It broke"));
        }
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

logHelper.getSummaryRaw = function() {
    return new Promise(function(resolve, reject) {
        if (true) {
            resolve({
                ads_blocked_today: 10,
                dns_queries_today: 200,
                ads_percentage_today: 10.2,
                domains_being_blocked: 20
            });
        } else {
            reject(Error("It broke"));
        }
    });
};

logHelper.getQueryTypes = function() {
    return new Promise(function(resolve, reject) {
        fs.access(appDefaults.logFile, fs.F_OK | fs.R_OK, function(err) {
            if (err) {
                reject(err);
            } else {
                var queryTypes = {};
                var lineReader = require("readline")
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

logHelper.getForwardDestinations = function() {
    return new Promise(function(resolve, reject) {
        fs.access(appDefaults.logFile, fs.F_OK | fs.R_OK, function(err) {
            if (err) {
                reject(err);
            } else {
                var destinations = {};
                var lineReader = require("readline")
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
        var lineReader = require("readline")
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
                var domains = {};
                var lineReader = require("readline")
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
                    if (domain in domains) {
                        domains[domain]++;
                    } else {
                        domains[domains] = 1;
                    }
                });
                lineReader.on("close", function() {
                    resolve(domains);
                });
            }
        });
    });
};

module.exports = logHelper;
