process.env.NODE_ENV = "test";

var chai = require("chai");
var chaiHttp = require("chai-http");
var backend = require("../server.js");
var sinon = require("sinon");
var should = chai.should();
var expect = chai.expect;

var server = new backend();
chai.use(chaiHttp);
const appDefaults = require("./../defaults.js");

var sandbox;
beforeEach(function () {
    sandbox = sinon.sandbox.create();
    const logFileStub = sandbox.stub(appDefaults, "logFile", __dirname + "/../test/pihole.log");
    const setupVarsStub = sandbox.stub(appDefaults, "setupVars", __dirname + "/../test/setupVars.conf");
    server.load();
});

afterEach(function () {
    sandbox.restore();
});

describe("Check endpoints", function () {
    describe("not authenticated", function () {
        it("get /", function (done) {
            chai.request(server.app)
            .get("/")
            .end(function (err, res) {
                if (err)
                    done(err);
                res.status.should.equal(200);
                done();
            });
        });
        it("get /home", function (done) {
            chai.request(server.app)
            .get("/home")
            .end(function (err, res) {
                if (err)
                    done(err);
                res.status.should.equal(200);
                done();
            });
        });
        describe("/login", function () {
            describe("get", function () {
                it("should succeed", function (done) {
                    chai.request(server.app)
                    .get("/login")
                    .end(function (err, res) {
                        if (err)
                            done(err);
                        res.status.should.equal(200);
                        done();
                    });
                });
            });
            describe("post", function () {
                it("should succeed", function (done) {
                    chai.request(server.app)
                    .post("/login")
                    .type("form")
                    .send({
                        pw : "password"
                    })
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        expect(res.status).to.be.equal(200);
                        done();
                    });
                });
                it("should fail and respond with 401", function (done) {
                    chai.request(server.app)
                    .post("/login")
                    .type("form")
                    .send({
                        pw : "passworda"
                    })
                    .end(function (err, res) {
                        expect(err).to.not.be.null;
                        expect(res.status).to.equal(401);
                        done();
                    });
                });
                it("should fail and respond with 400", function (done) {
                    chai.request(server.app)
                    .post("/login")
                    .type("form")
                    .send({
                        pwa : "password"
                    })
                    .end(function (err, res) {
                        expect(err).to.not.be.null;
                        expect(res.status).to.equal(400);
                        done();
                    });
                });
            });
        });
        it("get /logout", function (done) {
            chai.request(server.app)
            .get("/logout")
            .end(function (err, res) {
                if (err)
                    done(err);
                res.status.should.equal(200);
                done();
            });
        });
        describe("/api", function () {
            describe("/list", function () {
                it("should succeed", function (done) {
                    chai.request(server.app)
                    .get("/api/list")
                    .end(function (err, res) {
                        expect(err).to.not.be.null;
                        expect(res.status).to.equal(401);
                        done();
                    });
                });
            });
            describe("/data", function () {
                describe("?summary", function () {
                    it("should succeed", function (done) {
                        chai.request(server.app)
                        .get("/api/data?summary")
                        .end(function (err, res) {
                            expect(err).to.be.null;
                            expect(res.status).to.equal(200);
                            done();
                        });
                    });
                });
            });
        });
    });
});
