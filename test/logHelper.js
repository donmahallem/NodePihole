process.env.NODE_ENV = "test";
const chai = require("chai");
const sinon = require("sinon");
const should = chai.should();
const expect = chai.expect;
const helper = require("./../server/helper.js");
const logHelper = require("./../server/logHelper.js");
const appDefaults = require("./../server/defaults.js");
const moment = require("moment");
const readline = require("readline");
const childProcess = require("child_process");
const EventEmitter = require('events')
    .EventEmitter;
var sandbox;
const sourceTimestampFormat = "MMM DD hh:mm:ss"
const sourceTimestamp = moment()
    .format(sourceTimestampFormat);
const usedTimestamp = {
    "iso": moment(sourceTimestamp, sourceTimestampFormat)
        .toISOString(),
    "source": sourceTimestamp
};
describe("logHelper tests", function() {
    before(function() {
        sandbox = sinon.sandbox.create();
        // as stubing the default function of moment.js is tricky I will go this way

    });
    afterEach(function() {
        sandbox.reset();
    });
    after(function() {
        sandbox.restore();
    });
    describe("getFileLineCount()", function() {
        const tests = [{
            arg: "gravity.list2",
            expected: 0
        }, {
            arg: "gravity.list",
            expected: 15
        }];
        tests.forEach(function(test) {
            it("should count " + test.expected + " lines with " + test.arg, function(done) {
                var gravityCount = logHelper.getFileLineCount(__dirname + "/" + test.arg);
                gravityCount.then(function(result) {
                        expect(result)
                            .to.be.equal(test.expected);
                        done();
                    })
                    .catch(function(err) {
                        done(err);
                    });
            });
        });
    });
    describe("getSummary()", function() {
        var gravityListFileStub, blackListFileStub, parseLineStub, logFileStub;
        const queryObj = {
            domain: "aaaaaaaaaa.bbbbbb.ccccccccccc.net",
            timestamp: "timestamp",
            client: "1111:1111:1111:1111:1111:1111:1111:1111",
            type: "query",
            queryType: "AAAA"
        };
        const blockObj = {
            domain: "aaaaaaaaaa.bbbbbb.ccccccccccc.net",
            timestamp: "timestamp",
            list: "/etc/pihole/gravity.list",
            type: "block",
        };
        before(function() {
            gravityListFileStub = sandbox.stub(appDefaults, "gravityListFile", __dirname + "/gravity.list");
            blackListFileStub = sandbox.stub(appDefaults, "blackListFile", __dirname + "/gravity.list");
            logFileStub = sandbox.stub(appDefaults, "logFile", __dirname + "/gravity.list");
            parseLineStub = sandbox.stub(logHelper, "parseLine");
            for (var i = 0; i < 30; i++) {
                switch (i % 3) {
                    case 0:
                        parseLineStub.onCall(i)
                            .returns(queryObj);
                        break;
                    case 1:
                        parseLineStub.onCall(i)
                            .returns(blockObj);
                        break;
                    default:
                        parseLineStub.onCall(i)
                            .returns(false);
                        break;
                }
            }
            parseLineStub.returns(false);
        });
        afterEach(function() {
            parseLineStub.reset();
        });
        after(function() {
            gravityListFileStub.restore();
            blackListFileStub.restore();
            parseLineStub.restore();
            logFileStub.restore();
        });
        it("should give a working summary", function(done) {
            var gravityCount = logHelper.getSummary();
            gravityCount.then(function(result) {
                    expect(result)
                        .to.deep.equal({
                            adsBlockedToday: 5,
                            dnsQueriesToday: 5,
                            adsPercentageToday: 100,
                            domainsBeingBlocked: 30
                        });
                    done();
                })
                .catch(function(err) {
                    done(err);
                });
        });
    });
    describe("getGravity()", function() {
        var getDomainsStub;
        before(function() {
            getDomainsStub = sandbox.stub(logHelper, "getDomains");
            getDomainsStub.onCall(0)
                .returns(new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        resolve(["domain1.com", "domain2.com"]);
                    }, 100);
                }));
            getDomainsStub.onCall(1)
                .returns(new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        resolve(["domain3.com", "domain4.com"]);
                    }, 100);
                }));
            getDomainsStub.onCall(2)
                .returns(new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        resolve(["domain1.com", "domain3.com"]);
                    }, 100);
                }));
        });
        after(function() {
            getDomainsStub.restore();
        });
        it("should return 2 domains", function(done) {
            var gravity = logHelper.getGravity();
            gravity.then(function(result) {
                    expect(result)
                        .to.deep.equal({
                            "domain2.com": true,
                            "domain4.com": true
                        });
                    done();
                })
                .catch(function(err) {
                    done(err);
                });
        });
    });
    describe("getDomains()", function() {
        it("should return 6 domains", function(done) {
            var gravity = logHelper
                .getDomains(__dirname + "/whitelist.txt")
                .then(function(result) {
                    expect(result)
                        .to.deep.equal(["raw.githubusercontent.com",
                            "mirror1.malwaredomains.com",
                            "sysctl.org",
                            "zeustracker.abuse.ch",
                            "s3.amazonaws.com",
                            "hosts-file.net"
                        ]);
                    done();
                })
                .catch(function(err) {
                    done(err);
                });
        });
        it("should return 1 domain", function(done) {
            var gravity = logHelper
                .getDomains(__dirname + "/blacklist.txt")
                .then(function(result) {
                    expect(result)
                        .to.deep.equal(["blocked.blocked.blocked"]);
                    done();
                })
                .catch(function(err) {
                    done(err);
                });
        });
    });
    describe("getGravityCount()", function() {
        var gravityListFileStub, blackListFileStub;
        before(function() {
            gravityListFileStub = sandbox.stub(appDefaults, "gravityListFile", __dirname + "/gravity.list");
            blackListFileStub = sandbox.stub(appDefaults, "blackListFile", __dirname + "/gravity.list");
        });
        after(function() {
            gravityListFileStub.restore();
            blackListFileStub.restore();
        });
        it("should count 30 lines", function(done) {
            var gravityCount = logHelper.getGravityCount();
            gravityCount.then(function(result) {
                    expect(result)
                        .to.be.equal(30);
                    done();
                })
                .catch(function(err) {
                    done(err);
                });
        });
    });
    describe("createLogParser()", function() {
        var readlineStub;
        var lineSpy;
        var parseLineStub;
        before(function() {
            lineSpy = sinon.spy();
            parseLineStub = sinon.stub(logHelper, "parseLine");
            parseLineStub.returns(true);
            readlineStub = sandbox.stub(readline,
                "createInterface",
                function(filename) {
                    console.log("Called", filename);
                    const self = this;
                    self.emitter = new EventEmitter();
                    process.nextTick(function() {
                        for (var i = 0; i < 4; i++) {
                            self.emitter.emit("line", "foo bar");
                        }
                        self.emitter.emit("close");
                    });
                    return self.emitter;
                }
            );
        });
        after(function() {
            sinon.assert.callCount(lineSpy, 4);
            readlineStub.restore();
            parseLineStub.restore();
        });
        it("should return 0", function(done) {
            const logParser = logHelper.createLogParser("filename");
            logParser.on("line", lineSpy);
            logParser.on("close", function() {
                done();
            });

        });
    });
    describe("getFileLineCountWindows()", function() {
        var execStub;
        before(function() {
            execStub = sinon.stub(childProcess, "exec");
            execStub.onCall(0)
                .callsArgWith(1, false, "", "error occured");
            execStub.onCall(1)
                .callsArgWith(1, true, "", "");
            execStub.onCall(2)
                .callsArgWith(1, false, "---------- INDEX.JS 4", "");
            execStub.onCall(3)
                .callsArgWith(1, false, "---------- foooo", "");
        });
        after(function() {
            sinon.assert.alwaysCalledWith(execStub, "find /c /v \"\" \"filename\"")
            execStub.restore();
        });
        it("should return 0", function(done) {
            const callback = function(lines) {
                expect(lines)
                    .to.equal(0);
                done();
            };
            logHelper.getFileLineCountWindows("filename", callback);
        });
        it("should return 0", function(done) {
            const callback = function(lines) {
                expect(lines)
                    .to.equal(0);
                done();
            };
            logHelper.getFileLineCountWindows("filename", callback);
        });
        it("should return 4", function(done) {
            const callback = function(lines) {
                expect(lines)
                    .to.equal(4);
                done();
            };
            logHelper.getFileLineCountWindows("filename", callback);
        });
        it("should return 4", function(done) {
            const callback = function(lines) {
                expect(lines)
                    .to.equal(0);
                done();
            };
            logHelper.getFileLineCountWindows("filename", callback);
        });
    });
    describe("getAllQueries()", function() {
        var createLogParserStub;
        before(function() {
            createLogParserStub = sinon.stub(logHelper,
                "createLogParser",
                function(filename) {
                    const self = this;
                    self.emitter = new EventEmitter();
                    process.nextTick(function() {
                        for (var i = 0; i < 4; i++) {
                            self.emitter.emit("line", {
                                "type": "query",
                                "timestamp": usedTimestamp.iso
                            });
                            self.emitter.emit("line", {
                                "type": "block",
                                "timestamp": usedTimestamp.iso
                            });
                        };
                        self.emitter.emit("close");
                    });
                    return self.emitter;
                });
        });
        after(function() {
            sinon.assert.calledOnce(createLogParserStub);
            createLogParserStub.restore();
        });
        it("should succeed", function() {
            return logHelper.getAllQueries()
                .then(function(data) {
                    expect(data)
                        .to.have.lengthOf(8);
                });
        });
    });
    describe("getQuerySources()", function() {
        var createLogParserStub;
        before(function() {
            createLogParserStub = sinon.stub(logHelper,
                "createLogParser",
                function(filename) {
                    const self = this;
                    self.emitter = new EventEmitter();
                    process.nextTick(function() {
                        for (var i = 0; i < 4; i++) {
                            self.emitter.emit("line", {
                                "type": "query",
                                "timestamp": usedTimestamp.iso,
                                "client": "127.0.0.1"
                            });
                            self.emitter.emit("line", {
                                "type": "block",
                                "timestamp": usedTimestamp.iso
                            });
                        };
                        self.emitter.emit("close");
                    });
                    return self.emitter;
                });
        });
        after(function() {
            sinon.assert.calledOnce(createLogParserStub);
            createLogParserStub.restore();
        });
        it("should succeed", function() {
            return logHelper.getQuerySources()
                .then(function(data) {
                    expect(data)
                        .to.deep.equal({
                            "127.0.0.1": 4
                        });
                });
        });
    });
    describe("getOverTimeData()", function() {
        var createLogParserStub;
        before(function() {
            createLogParserStub = sinon.stub(logHelper,
                "createLogParser",
                function(filename) {
                    const self = this;
                    self.emitter = new EventEmitter();
                    process.nextTick(function() {
                        for (var i = 0; i < 4; i++) {
                            self.emitter.emit("line", {
                                "type": "query",
                                "timestamp": usedTimestamp.iso
                            });
                            self.emitter.emit("line", {
                                "type": "block",
                                "timestamp": usedTimestamp.iso
                            });
                        };
                        self.emitter.emit("close");
                    });
                    return self.emitter;
                });
        });
        after(function() {
            sinon.assert.calledOnce(createLogParserStub);
            createLogParserStub.restore();
        });
        it("should return 4", function() {
            return logHelper.getOverTimeData()
                .then(function(data) {
                    expect(data)
                        .to.have.all.keys('ads', 'queries')
                });
        });
    });
    describe("parseLine()", function() {
        const tests = [];
        ["1.1.1.1", "1111:1111:1111:1111:1111:1111:1111:1111"].forEach(function(client) {
            ["a.com", "a.b.com", "a.b.c.com"].forEach(function(domain) {
                ["AAAA", "AA"].forEach(function(queryType) {
                    tests.push({
                        "arg": usedTimestamp.source + " dnsmasq[503]: query[" + queryType + "] " + domain + " from " + client,
                        "result": {
                            "domain": domain,
                            "timestamp": usedTimestamp.iso,
                            "client": client,
                            "type": "query",
                            "queryType": queryType
                        }
                    });
                });
                ["/etc/pihole/gravity.list", "/some/other/path/gravity.list"].forEach(function(filepath) {
                    tests.push({
                        "arg": usedTimestamp.source + " dnsmasq[503]: " + filepath + " " + domain + " is " + client,
                        "result": {
                            domain: domain,
                            timestamp: usedTimestamp.iso,
                            list: filepath,
                            type: "block"
                        }
                    });
                    tests.push({
                        "arg": usedTimestamp.source + " dnsmasq[503]: val1 val2 " + filepath + " " + domain + " is " + client,
                        "result": {
                            domain: domain,
                            timestamp: usedTimestamp.iso,
                            list: filepath,
                            type: "block"
                        }
                    });
                });
                tests.push({
                    "arg": usedTimestamp.source + " dnsmasq[503]: forwarded " + domain + " to " + client,
                    "result": {
                        domain: domain,
                        timestamp: usedTimestamp.iso,
                        target: client,
                        type: "forward"
                    }
                });
            });
        });
        tests.forEach(function(test) {
            it("should parse " + test.result.type + " object successfull", function() {
                const result = logHelper.parseLine(test.arg);
                expect(result)
                    .to.not.be.null;
                expect(result)
                    .to.deep.equal(test.result);
            });
        });
        it("should parse return false", function() {
            const result = logHelper.parseLine("");
            expect(result)
                .to.not.be.null;
            expect(result)
                .to.be.false;
        });
        it("should parse return false", function() {
            const result = logHelper.parseLine(undefined);
            expect(result)
                .to.not.be.null;
            expect(result)
                .to.be.false;
        });
        it("should parse return false", function() {
            const result = logHelper.parseLine("foo bar");
            expect(result)
                .to.not.be.null;
            expect(result)
                .to.be.false;
        });
        it("should parse return false", function() {
            const result = logHelper.parseLine("foobar foo bar foo bar bar foo: bar bar foo");
            expect(result)
                .to.not.be.null;
            expect(result)
                .to.be.false;
        });
        it("should parse return false", function() {
            const result = logHelper.parseLine(usedTimestamp.source + " dnsmasq[503]: reply domain.name is <CNAME>");
            expect(result)
                .to.not.be.null;
            expect(result)
                .to.be.false;
        });
        it("should return false for invalid line", function() {
            const result = logHelper.parseLine("bhn123 3124u 213h4021 34921u3 410ß4 109234 145rj1 0ß235125 1 ß15 u120ß95 1ß125 120i 4021ß5 u");
            expect(result)
                .to.not.be.null;
            expect(result)
                .to.be.false;
        });
        it("should return false for invalid line", function() {
            const result = logHelper.parseLine("reply aaaaaaaaaa.bbbbbb.ccccccccccc.net is 127.0.0.1");
            expect(result)
                .to.not.be.null;
            expect(result)
                .to.be.false;
        });
    });
});
