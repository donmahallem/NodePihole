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
const fs = require("fs");
const stream = require('stream');
const through2 = require("through2");
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
        it("should give a working summary", function(done) {
            var result = {
                adsBlockedToday: 0,
                dnsQueriesToday: 0,
                adsPercentageToday: 0,
                domainsBeingBlocked: 0
            };
            var inputStream = through2.obj();
            var endStream = inputStream.pipe(logHelper.createSummarySpy(result))
                .on("end", function() {
                    expect(result)
                        .to.deep.equal({
                            adsBlockedToday: 5,
                            dnsQueriesToday: 5,
                            adsPercentageToday: 0,
                            domainsBeingBlocked: 0
                        });
                    done();
                })
                .on("error", function(err) {
                    done(err);
                });
            for (var i = 0; i < 5; i++) {
                inputStream.push({
                    domain: "aaaaaaaaaa.bbbbbb.ccccccccccc.net",
                    timestamp: "timestamp",
                    client: "1111:1111:1111:1111:1111:1111:1111:1111",
                    type: "query",
                    queryType: "AAAA"
                });
                inputStream.push({
                    domain: "aaaaaaaaaa.bbbbbb.ccccccccccc.net",
                    timestamp: "timestamp",
                    list: "/etc/pihole/gravity.list",
                    type: "block",
                });
            };
            inputStream.push(null);
            endStream.resume();
        });
    });
    describe("loadDomainFile()", function() {
        var createReadStreamStub;
        before(function() {
            createReadStreamStub = sandbox.stub(fs, "createReadStream", function(filename) {
                var runs = 0;
                var read = function(n) {
                    if (runs < 4) {
                        this.push("domain" + runs + ".com\n")
                        runs++;
                    } else {
                        this.push(null);
                    }
                };
                return new stream.Readable({
                    "read": read
                });
            });
        });
        after(function() {
            sinon.assert.callCount(createReadStreamStub, 2);
            createReadStreamStub.restore();
        });
        describe("without Blacklist", function() {
            it("should return 2 domains", function() {
                return logHelper.loadDomainFile("test")
                    .then(function(domains) {
                        expect(domains)
                            .to.deep.equal(["domain0.com", "domain1.com", "domain2.com", "domain3.com"]);
                    });
            });
        });
        describe("with Blacklist", function() {
            it("should return 2 domains", function() {
                return logHelper.loadDomainFile("test", ["domain0.com", "domain2.com"])
                    .then(function(domains) {
                        expect(domains)
                            .to.deep.equal(["domain1.com", "domain3.com"]);
                    });
            });
        });
    });
    describe("getGravity()", function() {
        var getDomainsStub;
        before(function() {
            getDomainsStub = sandbox.stub(logHelper, "loadDomainFile");
            getDomainsStub.onCall(0)
                .returns(new Promise(function(resolve, reject) {
                    resolve(["domain2.com", "domain4.com"]);
                }));
            getDomainsStub.onCall(1)
                .returns(new Promise(function(resolve, reject) {
                    resolve(["domain2.com"]);
                }));
            getDomainsStub.onCall(2)
                .returns(new Promise(function(resolve, reject) {
                    resolve(["domain4.com"]);
                }));
        });
        after(function() {
            getDomainsStub.restore();
        });
        it("should return 2 domains", function() {
            var gravity = logHelper.getGravity();
            return gravity.then(function(result) {
                expect(result)
                    .to.deep.equal([
                        "domain2.com",
                        "domain4.com"
                    ]);
                sinon.assert.calledWith(getDomainsStub, sinon.match.typeOf("string"), sinon.match.typeOf("array"));
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
        var createReadStreamStub;
        var lineSpy;
        before(function() {
            lineSpy = sinon.spy();
            createReadStreamStub = sandbox.stub(fs,
                "createReadStream",
                function(filename) {
                    var s = new stream.Readable();
                    process.nextTick(function() {
                        for (var i = 0; i < 4; i++) {
                            s.push("Jan 10 00:00:26 dnsmasq[503]: query[AAAA] test.com from 127.0.0.1\n");
                        }
                        s.push(null);
                    });
                    return s;
                }
            );
        });
        after(function() {
            sinon.assert.callCount(lineSpy, 4);
            createReadStreamStub.restore();
        });
        it("should return 0", function(done) {
            const logParser = logHelper.createLogParser("filename");
            logParser.on("data", lineSpy);
            logParser.on("end", function() {
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
    describe("createQueryTypesSpy()", function() {
        it("should return 4", function(done) {
            var result = {};
            var inputStream = through2.obj();
            var endStream = inputStream
                .pipe(logHelper.createQueryTypesSpy(result))
                .on("error", function(err) {
                    done(err);
                })
                .on("end", function() {
                    expect(result)
                        .to.deep.equal({
                            "AA": 4,
                            "AAAA": 4
                        });
                    done();
                });
            for (var i = 0; i < 4; i++) {
                inputStream.push({
                    "type": "query",
                    "queryType": "AA"
                });
                inputStream.push({
                    "type": "query",
                    "queryType": "AAAA"
                });
                inputStream.push({
                    "type": "block"
                });
            };
            inputStream.push(null);
            endStream.resume();
        });
    });
    describe("getTopItems()", function() {
        var getGravityStub, createLogParserStub;
        before(function() {
            getGravityStub = sinon.stub(logHelper, "getGravity", function() {
                return new Promise(function(resolve, reject) {
                    resolve({
                        "test1.com": true
                    });
                });
            });
            createLogParserStub = sinon.stub(logHelper,
                "createLogParser",
                function(filename) {
                    var s = through2.obj();
                    process.nextTick(function() {
                        for (var i = 0; i < 4; i++) {
                            s.push({
                                "type": "query",
                                "domain": "test1.com"
                            });
                            s.push({
                                "type": "query",
                                "domain": "test2.com"
                            });
                        };
                        s.push(null);
                    });
                    return s;
                });
        });
        after(function() {
            sinon.assert.calledOnce(createLogParserStub);
            createLogParserStub.restore();
            getGravityStub.restore();
        });
        it("should succeed", function() {
            return logHelper.getTopItems()
                .then(function(data) {
                    expect(data)
                        .to.deep.equal({
                            "topQueries": {
                                "test2.com": 4
                            },
                            "topAds": {
                                "test1.com": 4
                            }
                        });
                });
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
    describe("createForwardDestinationsSpy()", function() {
        it("should return 4", function(done) {
            var result = {};
            var inputStream = through2.obj();
            var endStream = inputStream
                .pipe(logHelper.createForwardDestinationsSpy(result))
                .on("error", function(err) {
                    done(err);
                })
                .on("end", function() {
                    expect(result)
                        .to.deep.equal({
                            "127.0.0.1": 10
                        });
                    done();
                });
            for (var i = 0; i < 10; i++) {
                inputStream.push({
                    "type": "forward",
                    "destination": "127.0.0.1"
                });
            }
            inputStream.push(null);
            endStream.resume();
        });
    });
    describe("createQuerySourcesSpy()", function() {
        it("should return 4", function(done) {
            var result = {};
            var inputStream = through2.obj();
            var endStream = inputStream
                .pipe(logHelper.createQuerySourcesSpy(result))
                .on("error", function(err) {
                    done(err);
                })
                .on("end", function() {
                    expect(result)
                        .to.deep.equal({
                            "127.0.0.1": 10
                        });
                    done();
                });
            for (var i = 0; i < 10; i++) {
                inputStream.push({
                    "type": "query",
                    "timestamp": usedTimestamp.iso,
                    "client": "127.0.0.1"
                });
                inputStream.push({
                    "type": "block",
                    "timestamp": usedTimestamp.iso
                });
            }
            inputStream.push(null);
            endStream.resume();
        });
    });
    describe("createOverTimeDataSpy()", function() {
        it("should return 4", function(done) {
            var result = {
                "ads": {},
                "queries": {}
            };
            var inputStream = through2.obj();
            var endStream = inputStream
                .pipe(logHelper.createOverTimeDataSpy(result))
                .on("error", function(err) {
                    done(err);
                })
                .on("end", function() {
                    expect(result)
                        .to.have.all.keys('ads', 'queries');
                    done();
                });
            for (var i = 0; i < 10; i++) {
                inputStream.push({
                    "timestamp": usedTimestamp.iso,
                    "type": "query"
                });
                inputStream.push({
                    "timestamp": usedTimestamp.iso,
                    "type": "block"
                });
            }
            inputStream.push(null);
            endStream.resume();
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
                        destination: client,
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
