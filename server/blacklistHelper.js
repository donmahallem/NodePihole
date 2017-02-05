const appDefaults = require("./defaults.js");
const fs = require("fs");
const os = require("os");
const childProcess = require("child_process");
const setupVars = require("./setupVars.js");
const helper = require("./helper.js");
const split2 = require("split2");
const through2 = require("through2");

/**
 * @exports blackListHelper
 */
var blacklistHelper = {};

blacklistHelper.createBlacklistWildcardStream = function() {
    var stream = helper.createFileLineStream(appDefaults.wildcardBlacklistFile);
    return stream.pipe(through2.obj(function(chunk, enc, callback) {
        var splits = chunk.split("/");
        if (splits.length === 3) {
            this.push(splits[1]);
        }
        callback()
    }));
};
blacklistHelper.mergeStreams = function(gen) {
    var outstream = through2.obj();
    var errorCallback = function(error) {
        process.nextTick(next);
    };
    var endCallback = function(source) {
        source.unpipe(outstream);
        process.nextTick(next);
    }

    function next() {
        var obj = gen.next()
            .value;
        var inStream;
        if (obj) {
            var filename = obj.path;
            inStream = fs.createReadStream(filename);
            inStream = inStream
                .once("error", errorCallback)
                .once("end", endCallback.bind(null, inStream))
                .pipe(split2());
            if (obj.transform) {
                inStream = inStream.pipe(obj.transform);
            }
            inStream = inStream
                .pipe(outstream, {
                    end: false
                });
        } else {
            outstream.end();
        }
    }
    next();
    return outstream;
};

const createSimpleDomainTransformer = function(type) {
    return through2.obj(function(chunk, enc, cb) {
        var trimmed = chunk.trim();
        if (trimmed.trim() !== "") {
            this.push({
                "domain": trimmed,
                "type": type
            });
        }
        cb();
    });
};
const createWildcardDomainTransformer = function(type) {
    return through2.obj(function(chunk, enc, cb) {
        var splits = chunk.split("/");
        if (splits.length === 3) {
            this.push({
                "domain": splits[1],
                "type": type
            })
        }
        cb();
    });
};

blacklistHelper.createBlacklistStream = function(lists) {
    var gen = function*() {
        if (lists.indexOf("wildcard") !== -1) {
            yield {
                "path": appDefaults.wildcardBlacklistFile,
                "transform": createWildcardDomainTransformer(2)
            };
        }
        if (lists.indexOf("black") !== -1) {
            yield {
                "path": appDefaults.blacklistFile,
                "transform": createSimpleDomainTransformer(1)
            };
        }
        if (lists.indexOf("white") !== -1) {
            yield {
                "path": appDefaults.whitelistFile,
                "transform": createSimpleDomainTransformer(3)
            };
        }
    };
    return blacklistHelper.mergeStreams(gen());

};
module.exports = blacklistHelper;
