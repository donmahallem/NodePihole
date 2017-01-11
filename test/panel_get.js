process.env.NODE_ENV = "test";

const chai = require("chai");
const chaiHttp = require("chai-http");
const Backend = require("../server.js");
const jwt = require("jsonwebtoken");
const sinon = require("sinon");
const should = chai.should();
const expect = chai.expect;
const helper = require("./../helper.js");

chai.use(chaiHttp);
const appDefaults = require("./../defaults.js");
var server = new Backend();
var sandbox;
beforeEach(function() {
    sandbox = sinon.sandbox.create();
    const logFileStub = sandbox.stub(appDefaults, "logFile", __dirname + "/../test/pihole.log");
    const setupVarsStub = sandbox.stub(appDefaults, "setupVars", __dirname + "/../test/setupVars.conf");
    const whiteListStub = sandbox.stub(appDefaults, "whiteListFile", __dirname + "/../test/whitelist.txt");
    const blackListStub = sandbox.stub(appDefaults, "blackListFile", __dirname + "/../test/blacklist.txt");

    server.load();
});

afterEach(function() {
    sandbox.restore();
});

describe("Check endpoints", function() {
    describe("not authenticated", function() {
        it("get /", function(done) {
            chai.request(server.app)
                .get("/")
                .end(function(err, res) {
                    expect(err)
                        .to.be.null;
                    expect(res.status)
                        .to.be.equal(200);
                    done();
                });
        });
        describe("/home", function(done) {
            describe("get", function(done) {
                it("should succeed", function(done) {
                    chai.request(server.app)
                        .get("/home")
                        .end(function(err, res) {
                            expect(err)
                                .to.be.null;
                            expect(res.status)
                                .to.be.equal(200);
                            done();
                        });
                });
            });
        });
        describe("/queries", function() {
            describe("get unauth", function() {
                it("should fail", function(done) {
                    chai.request(server.app)
                        .get("/queries")
                        .end(function(err, res) {
                            expect(err)
                                .to.not.be.null;
                            expect(res.status)
                                .to.be.equal(401);
                            done();
                        });
                });
                it("should fail", function(done) {
                    chai.request(server.app)
                        .get("/queries")
                        .set("Cookie", "auth=kasdfasfasldfkasödfkasdf")
                        .end(function(err, res) {
                            expect(err)
                                .to.not.be.null;
                            expect(res.status)
                                .to.be.equal(401);
                            done();
                        });
                });
            });
            describe("get auth", function() {
                var verifyCookieStub;
                beforeEach(function() {
                    verifyCookieStub = sandbox.stub(helper, "verifyAuthCookie", function(req, res, next) {
                        req.user = {
                            authenticated: true
                        }
                        next();
                    });
                });
                afterEach(function() {
                    sinon.assert.calledOnce(verifyCookieStub);
                    verifyCookieStub.restore();
                });
                it("should succeed", function(done) {
                    chai.request(server.app)
                        .get("/queries")
                        .end(function(err, res) {
                            expect(err)
                                .to.be.null;
                            expect(res.status)
                                .to.be.equal(200);
                            done();
                        });
                });
            });
        });
        describe("/settings", function() {
            describe("get unauth", function() {
                it("should fail", function(done) {
                    chai.request(server.app)
                        .get("/settings")
                        .end(function(err, res) {
                            expect(err)
                                .to.not.be.null;
                            expect(res.status)
                                .to.be.equal(401);
                            done();
                        });
                });
                it("should fail", function(done) {
                    chai.request(server.app)
                        .get("/settings")
                        .set("Cookie", "auth=kasdfasfasldfkasödfkasdf")
                        .end(function(err, res) {
                            expect(err)
                                .to.not.be.null;
                            expect(res.status)
                                .to.be.equal(401);
                            done();
                        });
                });
            });
            describe("get auth", function() {
                var verifyCookieStub;
                beforeEach(function() {
                    verifyCookieStub = sandbox.stub(helper, "verifyAuthCookie", function(req, res, next) {
                        req.user = {
                            authenticated: true
                        }
                        next();
                    });
                });
                afterEach(function() {
                    sinon.assert.calledOnce(verifyCookieStub);
                    verifyCookieStub.restore();
                });
                it("should succeed", function(done) {
                    chai.request(server.app)
                        .get("/settings")
                        .end(function(err, res) {
                            expect(err)
                                .to.be.null;
                            expect(res.status)
                                .to.be.equal(200);
                            done();
                        });
                });
            });
        });
        describe("/login", function() {
            describe("get", function() {
                it("should succeed", function(done) {
                    chai.request(server.app)
                        .get("/login")
                        .end(function(err, res) {
                            expect(err)
                                .to.be.null;
                            expect(res.status)
                                .to.be.equal(200);
                            done();
                        });
                });
            });
            describe("post", function() {
                it("should succeed", function(done) {
                    chai.request(server.app)
                        .post("/login")
                        .type("form")
                        .send({
                            pw: "password"
                        })
                        .end(function(err, res) {
                            expect(err)
                                .to.be.null;
                            expect(res.status)
                                .to.be.equal(200);
                            done();
                        });
                });
                it("should fail and respond with 401", function(done) {
                    chai.request(server.app)
                        .post("/login")
                        .type("form")
                        .send({
                            pw: "passworda"
                        })
                        .end(function(err, res) {
                            expect(err)
                                .to.not.be.null;
                            expect(res.status)
                                .to.equal(401);
                            done();
                        });
                });
                it("should fail and respond with 400", function(done) {
                    chai.request(server.app)
                        .post("/login")
                        .type("form")
                        .send({
                            pwa: "password"
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
        });
        describe("/logout", function() {
            describe("get", function() {
                it("should succeed", function(done) {
                    chai.request(server.app)
                        .get("/logout")
                        .end(function(err, res) {
                            expect(err)
                                .to.be.null;
                            expect(res.status)
                                .to.equal(200);
                            done();
                        });
                });
            });
        });
        describe("/api", function() {
            describe("/list", function() {
                describe("get - authenticated", function() {
                    var verifyCookieStub;
                    beforeEach(function() {
                        verifyCookieStub = sandbox.stub(helper, "verifyAuthCookie", function(req, res, next) {
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
                    it("should succeed", function(done) {
                        chai.request(server.app)
                            .get("/api/list")
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
            describe("/data", function() {
                describe("?summary", function() {
                    it("should succeed", function(done) {
                        chai.request(server.app)
                            .get("/api/data?summary")
                            .end(function(err, res) {
                                expect(err)
                                    .to.be.null;
                                expect(res.status)
                                    .to.equal(200);
                                done();
                            });
                    });
                });
            });
        });
    });
});
