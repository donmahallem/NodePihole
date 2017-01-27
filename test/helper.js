process.env.NODE_ENV = "test";
const chai = require("chai");
const sinon = require("sinon");
const fs = require("fs");
const should = chai.should();
const expect = chai.expect;
var appDefaults = require("./../server/defaults.js");
const helper = require("./../server/helper.js");
const setupVars = require("./../server/setupVars.js");
describe("helper tests", function() {
    var setupVarsStub, sandbox;
    before(function() {
        sandbox = sinon.sandbox.create();
        setupVarsStub = sandbox.stub(setupVars, "IPV4_ADDRESS", "127.0.0.1");
    });
    afterEach(function() {
        sandbox.reset();
    });
    after(function() {
        sandbox.restore();
    });
    describe(".express", function() {
        describe(".corsMiddleware()", function() {
            it("should count lines with ", function(done) {
                var req = {
                    hostname: "localhost",
                    headers: {
                        origin: "localhost"
                    }
                };
                var res = {
                    sendStatus: function(status) {
                        done();
                    },
                    set: function(name, value) {}
                };
                var next = function() {
                    done()
                };
                helper.express.corsMiddleware(req, res, next);
            });
        });

        describe(".csrfMiddleware()", function() {
            it("should succeed ", function(done) {
                var req = {
                    "body": {
                        "token": helper.hashWithSalt("token", appDefaults.csrfSecret)
                    },
                    "user": {
                        "authenticated": true,
                        "csrfToken": "token"
                    }
                };
                var next = function() {
                    done();
                };
                var res = {
                    "sendStatus": function(code) {
                        done(new Error("should be called"));
                    }
                };
                helper.express.csrfMiddleware(req, res, next);
            });
            it("should not succeed ", function(done) {
                var req = {
                    "body": {
                        "token": helper.hashWithSalt("wrongtoken", appDefaults.csrfSecret)
                    },
                    "user": {
                        "authenticated": true,
                        "csrfToken": "token"
                    }
                };
                var next = function() {
                    done(new Error("should not be called"));
                };
                var res = {
                    "sendStatus": function(code) {
                        expect(code)
                            .to.be.equal(401);
                        done();
                    }
                };
                helper.express.csrfMiddleware(req, res, next);
            });
            it("should not succeed ", function(done) {
                var req = {
                    "body": {
                        "token": "wrong token"
                    },
                    "user": {
                        "authenticated": true,
                        "csrfToken": "token"
                    }
                };
                var next = function() {
                    done(new Error("should not be called"));
                };
                var res = {
                    "sendStatus": function(code) {
                        expect(code)
                            .to.be.equal(401);
                        done();
                    }
                };
                helper.express.csrfMiddleware(req, res, next);
            });
            it("should not succeed ", function(done) {
                var req = {
                    "body": {
                        "wrongToken": "token"
                    },
                    "user": {
                        "authenticated": true,
                        "csrfToken": "token"
                    }
                };
                var next = function() {
                    done(new Error("should not be called"));
                };
                var res = {
                    "sendStatus": function(code) {
                        expect(code)
                            .to.be.equal(400);
                        done();
                    }
                };
                helper.express.csrfMiddleware(req, res, next);
            });
        });
    });
    describe("getFreeMemory()", function() {
        describe("/proc/meminfo doesn't exist", function() {
            var fsAccessStub;
            before(function() {
                fsAccessStub = sandbox.stub(fs, "access", function(path, flags, cb) {
                    cb(new Error());
                });
            });
            after(function() {
                fsAccessStub.restore();
            });
            it("should return false", function() {
                return helper.getFreeMemory()
                    .then(function(result) {
                        sinon.assert.calledWith(fsAccessStub, "/proc/meminfo");
                        sinon.assert.calledOnce(fsAccessStub);
                        expect(result)
                            .to.be.false;
                    });
            });
        });
        describe("/proc/meminfo does exist", function() {
            var fsAccessStub;
            var fsReadFileStub;
            before(function() {
                fsAccessStub = sandbox.stub(fs, "access", function(path, flags, cb) {
                    cb(false);
                });
                fsReadFileStub = sandbox.stub(fs, "readFile");
            });
            afterEach(function() {
                sinon.assert.calledWith(fsAccessStub, "/proc/meminfo");
                sinon.assert.calledOnce(fsAccessStub);
                fsAccessStub.reset();
                sinon.assert.calledWith(fsReadFileStub, "/proc/meminfo", "utf8");
                sinon.assert.calledOnce(fsReadFileStub);
                fsReadFileStub.reset();
            });
            after(function() {
                fsAccessStub.restore();
                fsReadFileStub.restore();
            });
            describe("/proc/meminfo contains all required lines", function() {
                before(function() {
                    fsReadFileStub.callsArgWith(2, false,  "MemFree: 100 kb\r\nMemTotal: 400 kb\rBuffers: 100 kb\nCached: 100 kb\r\n");
                });
                it("should return memory usage", function() {
                    return helper.getFreeMemory()
                        .then(function(result) {
                            expect(result)
                                .to.be.equal(0.25);
                        });
                });
            });
            describe("/proc/meminfo does not contain all required lines", function() {
                before(function() {
                    fsReadFileStub
                        .callsArgWith(2, false,"MemTotal: 400 kb\rBuffers: 100 kb\nCached: 100 kb\r\n");
                });
                it("should return false", function() {
                    return helper.getFreeMemory()
                        .then(function(result) {
							console.log("res",result);
                            expect(result)
                                .to.be.false;
                        });
                });
            });

        });
    });
});
