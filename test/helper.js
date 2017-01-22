process.env.NODE_ENV = "test";
const chai = require("chai");
const sinon = require("sinon");
const should = chai.should();
const expect = chai.expect;
var appDefaults = require("./../defaults.js");
const helper = require("./../helper.js");
const setupVars = require("./../setupVars.js");
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
});
