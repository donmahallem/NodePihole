const appDefaults = require("./defaults.js");
const fs = require("fs");
var logHelper = {

}

logHelper.getQueryTypes = function(callback) {
    fs.access(appDefaults.logFile, fs.F_OK | fs.R_OK, function(err) {
        if (err) {
            callback(err, false);
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
                callback(false, queryTypes);
            });
        }
    });
}

logHelper.getForwardDestinations = function(callback) {
    fs.access(appDefaults.logFile, fs.F_OK | fs.R_OK, function(err) {
        if (err) {
            callback(err, false);
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
                callback(false, destinations);
            });
        }
    });
};

module.exports = logHelper;
