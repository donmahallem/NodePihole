process.env.NODE_ENV = "test";
const chai = require("chai");
const chaiHttp = require("chai-http");
const Backend = require("./../server/server.js");
const jwt = require("jsonwebtoken");
const sinon = require("sinon");
const should = chai.should();
const expect = chai.expect;
const helper = require("./../server/helper.js");
chai.use(chaiHttp);
const appDefaults = require("./../server/defaults.js");
const logHelper = require("./../server/logHelper.js");
var server = new Backend();
var sandbox;
describe("Check endpoints", function() {
    before(function() {
        sandbox = sinon.sandbox.create();
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
                        .set("Host", "localhost")
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
                        .set("Host", "localhost")
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
                        .set("Host", "localhost")
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
                        .set("Host", "localhost")
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
                it("should succeed", function(done) {
                    chai.request(server.app)
                        .get("/queries")
                        .set("Host", "localhost")
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
                            .set("Host", "localhost")
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
                            .set("Host", "localhost")
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
                        verifyCookieStub = sandbox.stub(helper.express, "verifyAuthCookie", function(req, res, next) {
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
                            .set("Host", "localhost")
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
                            .set("Host", "localhost")
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
                            .set("Host", "localhost")
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
                            .set("Host", "localhost")
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
                        .set("Host", "localhost")
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
                        .set("Host", "localhost")
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
                    verifyCookieStub = sandbox.stub(helper.express, "verifyAuthCookie", function(req, res, next) {
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
                        .set("Host", "localhost")
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
                        .set("Host", "localhost")
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
                        .set("Host", "localhost")
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
                        .set("Host", "localhost")
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
                        .set("Host", "localhost")
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
