process.env.NODE_ENV = "test";
const chai = require("chai");
const chaiHttp = require("chai-http");
const Backend = require("../server/server.js");
const jwt = require("jsonwebtoken");
const sinon = require("sinon");
const should = chai.should();
const expect = chai.expect;
const helper = require("./../server/helper.js");
chai.use(chaiHttp);
const appDefaults = require("./../server/defaults.js");
const logHelper = require("./../server/logHelper.js");
const childProcess = require("child_process");
var server = new Backend();
var sandbox;
describe("Testing api endpoints", function() {
    before(function() {
        sandbox = sinon.sandbox.create();
    });
    after(function() {
        sandbox.restore();
    });
    describe("/api", function() {
        describe("/enable", function() {
            var execStub;
            before(function() {
                execStub = sandbox.stub(childProcess, "exec", function(arg, callback) {
                    callback(false, "", "");
                });
            });
            afterEach(function() {
                execStub.reset();
            });
            after(function() {
                execStub.restore();
            });
            describe("get", function() {
                it("should not succeed", function(done) {
                    chai.request(server.app)
                        .get("/api/enable")
                        .end(function(err, res) {
                            expect(err)
                                .to.not.be.null;
                            expect(res.status)
                                .to.equal(404);
                            sinon.assert.callCount(execStub, 0);
                            done();
                        });
                });
            });
            describe("post", function() {
                describe("authenticated", function() {
                    var verifyCookieStub, hashWithSaltStub;
                    before(function() {
                        hashWithSaltStub = sandbox.stub(helper, "hashWithSalt");
                        hashWithSaltStub.returns("token");
                        verifyCookieStub = sandbox.stub(helper.express, "verifyAuthCookie", function(req, res, next) {
                            req.user = {
                                authenticated: true
                            };
                            next();
                        });
                    });
                    afterEach(function() {
                        sinon.assert.calledOnce(verifyCookieStub);
                        verifyCookieStub.reset();
                        hashWithSaltStub.reset();
                    });
                    after(function() {
                        verifyCookieStub.restore();
                        hashWithSaltStub.restore();
                    });
                    it("should succeed", function(done) {
                        chai.request(server.app)
                            .post("/api/enable")
                            .type("form")
                            .set("Host", "localhost")
                            .send({
                                "token": "token"
                            })
                            .end(function(err, res) {
                                expect(err)
                                    .to.be.null;
                                expect(res.status)
                                    .to.equal(200);
                                sinon.assert.calledOnce(execStub);
                                sinon.assert.calledOnce(hashWithSaltStub);
                                expect(res.body)
                                    .to.deep.equal({
                                        "status": "enabled"
                                    });
                                sinon.assert.calledWith(execStub, "sudo pihole enable");
                                done();
                            });
                    });
                    it("should not succeed for wrong csrf", function(done) {
                        chai.request(server.app)
                            .post("/api/enable")
                            .type("form")
                            .set("Host", "localhost")
                            .send({
                                "token": "wrongtoken"
                            })
                            .end(function(err, res) {
                                expect(err)
                                    .to.not.be.null;
                                expect(res.status)
                                    .to.equal(401);
                                sinon.assert.calledOnce(hashWithSaltStub);
                                sinon.assert.callCount(execStub, 0);
                                done();
                            });
                    });
                    it("should not succeed for no csrf", function(done) {
                        chai.request(server.app)
                            .post("/api/enable")
                            .type("form")
                            .set("Host", "localhost")
                            .end(function(err, res) {
                                expect(err)
                                    .to.not.be.null;
                                expect(res.status)
                                    .to.equal(400);
                                sinon.assert.callCount(hashWithSaltStub, 0);
                                sinon.assert.callCount(execStub, 0);
                                done();
                            });
                    });
                });
                describe("not authenticated", function() {
                    it("should not succeed", function(done) {
                        chai.request(server.app)
                            .post("/api/enable")
                            .end(function(err, res) {
                                expect(err)
                                    .to.not.be.null;
                                expect(res.status)
                                    .to.equal(401);
                                sinon.assert.callCount(execStub, 0);
                                done();
                            });
                    });
                });
            });
        });
        describe("/disable", function() {
            var execStub;
            before(function() {
                execStub = sandbox.stub(childProcess, "exec", function(arg, callback) {
                    callback(false, "", "");
                });
            });
            afterEach(function() {
                execStub.reset();
            });
            after(function() {
                execStub.restore();
            });
            describe("get", function() {
                it("should not succeed", function(done) {
                    chai.request(server.app)
                        .get("/api/disable")
                        .end(function(err, res) {
                            expect(err)
                                .to.not.be.null;
                            expect(res.status)
                                .to.equal(404);
                            sinon.assert.callCount(execStub, 0);
                            done();
                        });
                });
            });
            describe("post", function() {
                describe("authenticated", function() {
                    var verifyCookieStub, hashWithSaltStub;
                    before(function() {
                        hashWithSaltStub = sandbox.stub(helper, "hashWithSalt");
                        hashWithSaltStub.returns("token");
                        verifyCookieStub = sandbox.stub(helper.express, "verifyAuthCookie", function(req, res, next) {
                            req.user = {
                                authenticated: true
                            };
                            next();
                        });
                    });
                    afterEach(function() {
                        sinon.assert.calledOnce(verifyCookieStub);
                        verifyCookieStub.reset();
                        hashWithSaltStub.reset();
                    });
                    after(function() {
                        verifyCookieStub.restore();
                        hashWithSaltStub.restore();
                    });
                    [0, 10, 40, 90].forEach(function(time) {
                        it("should succeed for time: " + time, function(done) {
                            chai.request(server.app)
                                .post("/api/disable")
                                .type("form")
                                .set("Host", "localhost")
                                .send({
                                    "time": time,
                                    "token": "token"
                                })
                                .end(function(err, res) {
                                    expect(err)
                                        .to.be.null;
                                    expect(res.status)
                                        .to.equal(200);
                                    sinon.assert.calledOnce(execStub);
                                    sinon.assert.calledOnce(hashWithSaltStub);
                                    expect(res.body)
                                        .to.deep.equal({
                                            "status": "disabled"
                                        });
                                    sinon.assert.calledWith(execStub, "sudo pihole disable" + (time > 0 ? " " + time + "s" : ""));
                                    done();
                                });
                        });
                    });
                    it("should not succeed for wrong csrf", function(done) {
                        chai.request(server.app)
                            .post("/api/disable")
                            .type("form")
                            .set("Host", "localhost")
                            .send({
                                "time": 0,
                                "token": "wrongtoken"
                            })
                            .end(function(err, res) {
                                expect(err)
                                    .to.not.be.null;
                                expect(res.status)
                                    .to.equal(401);
                                sinon.assert.calledOnce(hashWithSaltStub);
                                sinon.assert.callCount(execStub, 0);
                                done();
                            });
                    });
                    it("should not succeed for no csrf", function(done) {
                        chai.request(server.app)
                            .post("/api/disable")
                            .type("form")
                            .set("Host", "localhost")
                            .send({
                                "time": 0
                            })
                            .end(function(err, res) {
                                expect(err)
                                    .to.not.be.null;
                                expect(res.status)
                                    .to.equal(400);
                                sinon.assert.callCount(hashWithSaltStub, 0);
                                sinon.assert.callCount(execStub, 0);
                                done();
                            });
                    });
                    it("should not succeed for no time", function(done) {
                        chai.request(server.app)
                            .post("/api/disable")
                            .type("form")
                            .set("Host", "localhost")
                            .send({
                                "token": "token"
                            })
                            .end(function(err, res) {
                                expect(err)
                                    .to.not.be.null;
                                expect(res.status)
                                    .to.equal(400);
                                sinon.assert.calledOnce(hashWithSaltStub);
                                sinon.assert.callCount(execStub, 0);
                                done();
                            });
                    });
                    it("should not succeed for string in time", function(done) {
                        chai.request(server.app)
                            .post("/api/disable")
                            .type("form")
                            .set("Host", "localhost")
                            .send({
                                "time": "a0",
                                "token": "token"
                            })
                            .end(function(err, res) {
                                expect(err)
                                    .to.not.be.null;
                                expect(res.status)
                                    .to.equal(400);
                                sinon.assert.calledOnce(hashWithSaltStub);
                                sinon.assert.callCount(execStub, 0);
                                done();
                            });
                    });
                });
                describe("not authenticated", function() {
                    it("should not succeed", function(done) {
                        chai.request(server.app)
                            .post("/api/disable")
                            .end(function(err, res) {
                                expect(err)
                                    .to.not.be.null;
                                expect(res.status)
                                    .to.equal(401);
                                sinon.assert.callCount(execStub, 0);
                                done();
                            });
                    });
                });
            });
        });
        describe("/list", function() {
            describe("get", function() {
                describe("authenticated", function() {
                    var verifyCookieStub;
                    beforeEach(function() {
                        verifyCookieStub = sandbox.stub(helper.express, "verifyAuthCookie", function(req, res, next) {
                            req.user = {
                                authenticated: true
                            };
                            next();
                        });
                    });
                    afterEach(function() {
                        sinon.assert.calledOnce(verifyCookieStub);
                        verifyCookieStub.restore();
                    });
                    it("should not succeed", function(done) {
                        chai.request(server.app)
                            .get("/api/list")
                            .set("Host", "localhost")
                            .end(function(err, res) {
                                expect(err)
                                    .to.not.be.null;
                                expect(res.status)
                                    .to.equal(400);
                                done();
                            });
                    });
                    it("should succeed", function(done) {
                        chai.request(server.app)
                            .get("/api/list")
                            .set("Host", "localhost")
                            .query({
                                "list": "white"
                            })
                            .end(function(err, res) {
                                expect(err)
                                    .to.be.null;
                                expect(res.status)
                                    .to.equal(200);
                                done();
                            });
                    });
                    it("should succeed", function(done) {
                        chai.request(server.app)
                            .get("/api/list")
                            .set("Host", "localhost")
                            .query({
                                "list": "black"
                            })
                            .end(function(err, res) {
                                expect(err)
                                    .to.be.null;
                                expect(res.status)
                                    .to.equal(200);
                                expect(res.header["content-type"])
                                    .to.not.be.null;
                                expect(res.header["content-type"])
                                    .to.contain("application/json");
                                done();
                            });
                    });
                    it("should not succeed", function(done) {
                        chai.request(server.app)
                            .get("/api/list")
                            .set("Host", "localhost")
                            .query({
                                "list": "unknown"
                            })
                            .end(function(err, res) {
                                expect(err)
                                    .to.not.be.null;
                                expect(res.status)
                                    .to.equal(400);
                                done();
                            });
                    });
                });
                describe("get - unauthenticated", function() {
                    it("should not succeed", function(done) {
                        chai.request(server.app)
                            .get("/api/list")
                            .set("Host", "localhost")
                            .end(function(err, res) {
                                expect(err)
                                    .to.not.be.null;
                                expect(res.status)
                                    .to.equal(401);
                                done();
                            });
                    });
                });
            });
            describe("post", function() {
                var execStub;
                before(function() {
                    execStub = sandbox.stub(childProcess, "exec", function(arg, callback) {

                    });
                });
                afterEach(function() {
                    execStub.reset();
                });
                after(function() {
                    execStub.restore();
                });
                describe("authenticated", function() {
                    var hashWithSaltStub, verifyCookieStub;
                    before(function() {
                        hashWithSaltStub = sandbox.stub(helper, "hashWithSalt");
                        hashWithSaltStub.returns("token");
                        verifyCookieStub = sandbox.stub(helper.express, "verifyAuthCookie", function(req, res, next) {
                            req.user = {
                                authenticated: true
                            };
                            next();
                        });
                    });
                    afterEach(function() {
                        sinon.assert.calledOnce(hashWithSaltStub);
                        sinon.assert.calledOnce(verifyCookieStub);
                        hashWithSaltStub.reset();
                        verifyCookieStub.reset();
                    });
                    after(function() {
                        hashWithSaltStub.restore();
                        verifyCookieStub.restore();
                    });
                    it("should not succeed for missing list name", function(done) {
                        chai.request(server.app)
                            .post("/api/list")
                            .type("form")
                            .set("Host", "localhost")
                            .send({
                                "domain": "test.com",
                                "token": "token"
                            })
                            .end(function(err, res) {
                                expect(err)
                                    .to.not.be.null;
                                expect(res.status)
                                    .to.equal(404);
                                sinon.assert.callCount(execStub, 0);
                                done();
                            });
                    });
                    it("should not succeed for wrong list name", function(done) {
                        chai.request(server.app)
                            .post("/api/list")
                            .type("form")
                            .set("Host", "localhost")
                            .send({
                                "domain": "test.com",
                                "token": "token",
                                "list": "whitee"
                            })
                            .end(function(err, res) {
                                expect(err)
                                    .to.not.be.null;
                                expect(res.status)
                                    .to.equal(401);
                                sinon.assert.callCount(execStub, 0);
                                done();
                            });
                    });
                    it("should succeed for white list", function(done) {
                        chai.request(server.app)
                            .post("/api/list")
                            .type("form")
                            .set("Host", "localhost")
                            .send({
                                "domain": "test.com",
                                "token": "token",
                                "list": "white"
                            })
                            .end(function(err, res) {
                                expect(err)
                                    .to.be.null;
                                expect(res.status)
                                    .to.equal(200);
                                sinon.assert.calledOnce(execStub);
                                sinon.assert.calledWithExactly(execStub, "sudo pihole -w -q test.com");
                                done();
                            });
                    });
                    it("should succeed for black list", function(done) {
                        chai.request(server.app)
                            .post("/api/list")
                            .type("form")
                            .set("Host", "localhost")
                            .send({
                                "domain": "test.com",
                                "token": "token",
                                "list": "black"
                            })
                            .end(function(err, res) {
                                expect(err)
                                    .to.be.null;
                                expect(res.status)
                                    .to.equal(200);
                                sinon.assert.calledOnce(execStub);
                                sinon.assert.calledWithExactly(execStub, "sudo pihole -b -q test.com");
                                done();
                            });
                    });
                });
                describe("unauthenticated", function() {
                    afterEach(function() {
                        sinon.assert.callCount(execStub, 0);
                    });
                    it("should not succeed for right csrf", function(done) {
                        chai.request(server.app)
                            .post("/api/list")
                            .set("Host", "localhost")
                            .send({
                                "domain": "test.com",
                                "token": "token"
                            })
                            .end(function(err, res) {
                                expect(err)
                                    .to.not.be.null;
                                expect(res.status)
                                    .to.equal(401);
                                done();
                            });
                    });
                    it("should not succeed", function(done) {
                        chai.request(server.app)
                            .post("/api/list")
                            .set("Host", "localhost")
                            .send({
                                "domain": "test.com",
                                "token": "wrongtoken"
                            })
                            .end(function(err, res) {
                                expect(err)
                                    .to.not.be.null;
                                expect(res.status)
                                    .to.equal(401);
                                done();
                            });
                    });
                });
            });
            describe("delete", function() {
                var execStub;
                before(function() {
                    execStub = sandbox.stub(childProcess, "exec", function(arg, callback) {

                    });
                });
                afterEach(function() {
                    execStub.reset();
                });
                after(function() {
                    execStub.restore();
                });
                describe("authenticated", function() {
                    var hashWithSaltStub, verifyCookieStub;
                    before(function() {
                        hashWithSaltStub = sandbox.stub(helper, "hashWithSalt");
                        hashWithSaltStub.returns("token");
                        verifyCookieStub = sandbox.stub(helper.express, "verifyAuthCookie", function(req, res, next) {
                            req.user = {
                                authenticated: true
                            };
                            next();
                        });
                    });
                    afterEach(function() {
                        sinon.assert.calledOnce(hashWithSaltStub);
                        sinon.assert.calledOnce(verifyCookieStub);
                        hashWithSaltStub.reset();
                        verifyCookieStub.reset();
                    });
                    after(function() {
                        hashWithSaltStub.restore();
                        verifyCookieStub.restore();
                    });
                    it("should not succeed for missing list name", function(done) {
                        chai.request(server.app)
                            .delete("/api/list")
                            .type("form")
                            .set("Host", "localhost")
                            .send({
                                "domain": "test.com",
                                "token": "token"
                            })
                            .end(function(err, res) {
                                expect(err)
                                    .to.not.be.null;
                                expect(res.status)
                                    .to.equal(404);
                                sinon.assert.callCount(execStub, 0);
                                done();
                            });
                    });
                    it("should not succeed for wrong list name", function(done) {
                        chai.request(server.app)
                            .delete("/api/list")
                            .type("form")
                            .set("Host", "localhost")
                            .send({
                                "domain": "test.com",
                                "token": "token",
                                "list": "whitee"
                            })
                            .end(function(err, res) {
                                expect(err)
                                    .to.not.be.null;
                                expect(res.status)
                                    .to.equal(401);
                                sinon.assert.callCount(execStub, 0);
                                done();
                            });
                    });
                    it("should succeed for white list", function(done) {
                        chai.request(server.app)
                            .delete("/api/list")
                            .type("form")
                            .set("Host", "localhost")
                            .send({
                                "domain": "test.com",
                                "token": "token",
                                "list": "white"
                            })
                            .end(function(err, res) {
                                expect(err)
                                    .to.be.null;
                                expect(res.status)
                                    .to.equal(200);
                                sinon.assert.calledOnce(execStub);
                                sinon.assert.calledWithExactly(execStub, "sudo pihole -w -q -d test.com");
                                done();
                            });
                    });
                    it("should succeed for black list", function(done) {
                        chai.request(server.app)
                            .delete("/api/list")
                            .type("form")
                            .set("Host", "localhost")
                            .send({
                                "domain": "test.com",
                                "token": "token",
                                "list": "black"
                            })
                            .end(function(err, res) {
                                expect(err)
                                    .to.be.null;
                                expect(res.status)
                                    .to.equal(200);
                                sinon.assert.calledOnce(execStub);
                                sinon.assert.calledWithExactly(execStub, "sudo pihole -b -q -d test.com");
                                done();
                            });
                    });
                });
                describe("unauthenticated", function() {
                    afterEach(function() {
                        sinon.assert.callCount(execStub, 0);
                    });
                    it("should not succeed for right csrf", function(done) {
                        chai.request(server.app)
                            .delete("/api/list")
                            .set("Host", "localhost")
                            .send({
                                "domain": "test.com",
                                "token": "token"
                            })
                            .end(function(err, res) {
                                expect(err)
                                    .to.not.be.null;
                                expect(res.status)
                                    .to.equal(401);
                                done();
                            });
                    });
                    it("should not succeed", function(done) {
                        chai.request(server.app)
                            .delete("/api/list")
                            .set("Host", "localhost")
                            .send({
                                "domain": "test.com",
                                "token": "wrongtoken"
                            })
                            .end(function(err, res) {
                                expect(err)
                                    .to.not.be.null;
                                expect(res.status)
                                    .to.equal(401);
                                done();
                            });
                    });
                });
            });
        });
        describe("/data", function() {
            var stubs = [];
            before(function() {
                stubs.push(sandbox.stub(logHelper, "getOverTimeData", function() {
                    return new Promise(function(resolve, reject) {
                        resolve({
                            "success": true
                        });
                    });
                }));
                stubs.push(sandbox.stub(logHelper, "getQueryTypes", function() {
                    return new Promise(function(resolve, reject) {
                        resolve({
                            "success": true
                        });
                    });
                }));
                stubs.push(sandbox.stub(logHelper, "getForwardDestinations", function() {
                    return new Promise(function(resolve, reject) {
                        resolve({
                            "success": true
                        });
                    });
                }));
                stubs.push(sandbox.stub(logHelper, "getTopItems", function() {
                    return new Promise(function(resolve, reject) {
                        resolve({
                            "success": true
                        });
                    });
                }));
                stubs.push(sandbox.stub(logHelper, "getAllQueries", function() {
                    return new Promise(function(resolve, reject) {
                        resolve({
                            "success": true
                        });
                    });
                }));
                stubs.push(sandbox.stub(logHelper, "getSummary", function() {
                    return new Promise(function(resolve, reject) {
                        resolve({
                            "success": true
                        });
                    });
                }));
            });
            after(function() {
                for (var i = 0; i < stubs.length; i++) {
                    stubs[i].restore();
                }
            });
            describe("get unauthenticated", function() {

                const supportedDataQueries = {
                    "summary": {
                        "authRequired": false
                    },
                    "overTimeData": {
                        "authRequired": false
                    },
                    "topItems": {
                        "authRequired": true
                    },
                    "queryTypes": {
                        "authRequired": true
                    },
                    "forwardDestinations": {
                        "authRequired": true
                    },
                    "allQueries": {
                        "authRequired": true
                    }
                };
                for (var query in supportedDataQueries) {
                    (function(arg, authRequired) {
                        it("should " + (authRequired ? "not " : "") + "succeed ?" + arg, function(done) {
                            chai.request(server.app)
                                .get("/api/data?" + arg)
                                .set("Host", "localhost")
                                .end(function(err, res) {
                                    if (authRequired) {
                                        expect(err)
                                            .to.not.be.null;
                                        expect(res.status)
                                            .to.equal(401);
                                    } else {
                                        expect(err)
                                            .to.be.null;
                                        expect(res.status)
                                            .to.equal(200);
                                    }
                                    done();
                                });
                        });
                    })(query, supportedDataQueries[query].authRequired);
                }
            });
            describe("get unauthenticated", function() {

                var verifyCookieStub;
                before(function() {
                    verifyCookieStub = sandbox.stub(helper.express, "verifyAuthCookie", function(req, res, next) {
                        req.user = {
                            authenticated: true
                        };
                        next();
                    });
                });
                after(function() {
                    verifyCookieStub.restore();
                });
                const supportedDataQueries = {
                    "summary": {
                        "authRequired": false
                    },
                    "overTimeData": {
                        "authRequired": false
                    },
                    "topItems": {
                        "authRequired": true
                    },
                    "queryTypes": {
                        "authRequired": true
                    },
                    "forwardDestinations": {
                        "authRequired": true
                    },
                    "allQueries": {
                        "authRequired": true
                    }
                };
                for (var query in supportedDataQueries) {
                    (function(arg, authRequired) {
                        it("should succeed ?" + arg, function(done) {
                            chai.request(server.app)
                                .get("/api/data?" + arg)
                                .set("Host", "localhost")
                                .end(function(err, res) {
                                    expect(err)
                                        .to.be.null;
                                    expect(res.status)
                                        .to.equal(200);
                                    expect(res.body)
                                        .to.deep.equal({
                                            "success": true
                                        });
                                    expect(res)
                                        .to.be.json;
                                    done();
                                });
                        });
                    })(query, supportedDataQueries[query].authRequired);
                }
            });
        });
    });
});
