process.env.NODE_ENV = "test";
const chai = require("chai");
const sinon = require("sinon");
const should = chai.should();
const expect = chai.expect;
const helper = require("./../helper.js");
const logHelper = require("./../logHelper.js");
const appDefaults = require("./../defaults.js");
const moment = require("moment");
const readline = require("readline");
var sandbox;
describe("logHelper tests", function() {
    var usedTimestamp;
    before(function() {
        sandbox = sinon.sandbox.create();
        // as stubing the default function of moment.js is tricky I will go this way
        const sourceTimestampFormat = "MMM DD hh:mm:ss"
        const sourceTimestamp = moment()
            .format(sourceTimestampFormat);
        usedTimestamp = {
            "iso": moment(sourceTimestamp, sourceTimestampFormat)
                .toISOString(),
            "source": sourceTimestamp
        };
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
                            ads_blocked_today: 5,
                            dns_queries_today: 5,
                            ads_percentage_today: 100,
                            domains_being_blocked: 30
                        });
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
    describe("parseLine()", function() {
        it("should parse query successfull", function() {
            const result = logHelper.parseLine(usedTimestamp.source + " dnsmasq[503]: query[AAAA] aaaaaaaaaa.bbbbbb.ccccccccccc.net from 1111:1111:1111:1111:1111:1111:1111:1111");
            expect(result)
                .to.not.be.null;
            expect(result)
                .to.deep.equal({
                    domain: "aaaaaaaaaa.bbbbbb.ccccccccccc.net",
                    timestamp: usedTimestamp.iso,
                    client: "1111:1111:1111:1111:1111:1111:1111:1111",
                    type: "query",
                    queryType: "AAAA"
                });
        });
        it("should parse query successfull", function() {
            const result = logHelper.parseLine(usedTimestamp.source + " dnsmasq[503]: query[AAAA] aaaaaaaaaa.bbbbbb.ccccccccccc.net from 127.0.0.1");
            expect(result)
                .to.not.be.null;
            expect(result)
                .to.deep.equal({
                    domain: "aaaaaaaaaa.bbbbbb.ccccccccccc.net",
                    timestamp: usedTimestamp.iso,
                    client: "127.0.0.1",
                    type: "query",
                    queryType: "AAAA"
                });
        });
        it("should parse query successfull", function() {
            const result = logHelper.parseLine(usedTimestamp.source + " dnsmasq[503]: query[A] aaaaaaaaaa.bbbbbb.ccccccccccc.net from 1111:1111:1111:1111:1111:1111:1111:1111");
            expect(result)
                .to.not.be.null;
            expect(result)
                .to.deep.equal({
                    domain: "aaaaaaaaaa.bbbbbb.ccccccccccc.net",
                    timestamp: usedTimestamp.iso,
                    client: "1111:1111:1111:1111:1111:1111:1111:1111",
                    type: "query",
                    queryType: "A"
                });
        });
        it("should parse query successfull", function() {
            const result = logHelper.parseLine(usedTimestamp.source + " dnsmasq[503]: query[A] aaaaaaaaaa.bbbbbb.ccccccccccc.net from 127.0.0.1");
            expect(result)
                .to.not.be.null;
            expect(result)
                .to.deep.equal({
                    domain: "aaaaaaaaaa.bbbbbb.ccccccccccc.net",
                    timestamp: usedTimestamp.iso,
                    client: "127.0.0.1",
                    type: "query",
                    queryType: "A"
                });
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
        it("should return block successfull", function() {
            const result = logHelper.parseLine(usedTimestamp.source + " dnsmasq[503]: /etc/pihole/gravity.list aaaaaaaaaa.bbbbbb.ccccccccccc.net is 1111:1111:1111:1111:1111:1111:1111:1111");
            expect(result)
                .to.not.be.null;
            expect(result)
                .to.deep.equal({
                    domain: "aaaaaaaaaa.bbbbbb.ccccccccccc.net",
                    timestamp: usedTimestamp.iso,
                    list: "/etc/pihole/gravity.list",
                    type: "block",
                });
        });
        it("should return block successfull", function() {
            const result = logHelper.parseLine(usedTimestamp.source + " dnsmasq[503]: 1 2 /etc/pihole/gravity.list aaaaaaaaaa.bbbbbb.ccccccccccc.net is 1111:1111:1111:1111:1111:1111:1111:1111");
            expect(result)
                .to.not.be.null;
            expect(result)
                .to.deep.equal({
                    domain: "aaaaaaaaaa.bbbbbb.ccccccccccc.net",
                    timestamp: usedTimestamp.iso,
                    list: "/etc/pihole/gravity.list",
                    type: "block",
                });
        });
        it("should return block successfull", function() {
            const result = logHelper.parseLine(usedTimestamp.source + " dnsmasq[503]: 1 2 /etc/pihole/gravity.list aaaaaaaaaa.bbbbbb.ccccccccccc.net is 1111:1111:1111:1111:1111:1111:1111:1111");
            expect(result)
                .to.not.be.null;
            expect(result)
                .to.deep.equal({
                    domain: "aaaaaaaaaa.bbbbbb.ccccccccccc.net",
                    timestamp: usedTimestamp.iso,
                    list: "/etc/pihole/gravity.list",
                    type: "block",
                });
        });
        it("should return false for invalid block line", function() {
            const result = logHelper.parseLine(usedTimestamp.source + " dnsmasq[503]: 1 2 /etc/pihole/block.list aaaaaaaaaa.bbbbbb.ccccccccccc.net is 1111:1111:1111:1111:1111:1111:1111:1111");
            expect(result)
                .to.not.be.null;
            expect(result)
                .to.be.false;
        });
    });
});
