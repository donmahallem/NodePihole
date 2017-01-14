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
const logHelper = require("./../logHelper.js");
var server = new Backend();
var sandbox;
describe("Check endpoints", function() {
    before(function() {
        sandbox = sinon.sandbox.create();
        const logFileStub = sandbox.stub(appDefaults, "logFile", __dirname + "/../test/pihole.log");
        const setupVarsStub = sandbox.stub(appDefaults, "setupVars", __dirname + "/../test/setupVars.conf");
        const whiteListStub = sandbox.stub(appDefaults, "whiteListFile", __dirname + "/../test/whitelist.txt");
        const blackListStub = sandbox.stub(appDefaults, "blackListFile", __dirname + "/../test/blacklist.txt");
        server.load();
    });
    after(function() {
        sandbox.restore();
    });
    describe("not authenticated", function() {
        describe("/home", function(done) {
            describe("get", function(done) {
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
                        };
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
        describe("/taillog", function() {
            describe("get", function() {
                describe("unauthenticated", function() {
                    it("should fail", function(done) {
                        chai.request(server.app)
                            .get("/taillog")
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
                            .get("/taillog")
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
                describe("authenticated", function() {
                    var verifyCookieStub;
                    before(function() {
                        verifyCookieStub = sandbox.stub(helper, "verifyAuthCookie", function(req, res, next) {
                            req.user = {
                                authenticated: true
                            }
                            next();
                        });
                    });
                    afterEach(function() {
                        sinon.assert.calledOnce(verifyCookieStub);
                        verifyCookieStub.reset();
                    });
                    after(function() {
                        verifyCookieStub.restore();
                    });
                    it("should succeed", function(done) {
                        chai.request(server.app)
                            .get("/taillog")
                            .end(function(err, res) {
                                expect(err)
                                    .to.be.null;
                                expect(res.status)
                                    .to.be.equal(200);
                                done();
                            });
                    });
                    it("should fail", function(done) {
                        chai.request(server.app)
                            .post("/taillog")
                            .end(function(err, res) {
                                expect(err)
                                    .to.not.be.null;
                                expect(res.status)
                                    .to.be.equal(404);
                                done();
                            });
                    });
                    it("should fail", function(done) {
                        chai.request(server.app)
                            .put("/taillog")
                            .end(function(err, res) {
                                expect(err)
                                    .to.not.be.null;
                                expect(res.status)
                                    .to.be.equal(404);
                                done();
                            });
                    });
                    it("should fail", function(done) {
                        chai.request(server.app)
                            .delete("/taillog")
                            .end(function(err, res) {
                                expect(err)
                                    .to.not.be.null;
                                expect(res.status)
                                    .to.be.equal(404);
                                done();
                            });
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
    });
});
