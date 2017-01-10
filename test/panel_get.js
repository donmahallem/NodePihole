process.env.NODE_ENV = "test";

var chai = require("chai");
var chaiHttp = require("chai-http");
var server = require("../index");
var should = chai.should();

chai.use(chaiHttp);

describe("Check endpoints", function () {
    describe("not authenticated", function () {
        it("get /", function (done) {
            chai.request(server)
            .get("/")
            .end(function (err, res) {
                if (err)
                    done(err);
                res.status.should.equal(200);
                done();
            });
        });
        it("get /home", function (done) {
            chai.request(server)
            .get("/home")
            .end(function (err, res) {
                if (err)
                    done(err);
                res.status.should.equal(200);
                done();
            });
        });
        it("get /login", function (done) {
            chai.request(server)
            .get("/login")
            .end(function (err, res) {
                if (err)
                    done(err);
                res.status.should.equal(200);
                done();
            });
        });
        it("get /logout", function (done) {
            chai.request(server)
            .get("/logout")
            .end(function (err, res) {
                if (err)
                    done(err);
                res.status.should.equal(200);
                done();
            });
        });
        describe("api endpoints", function () {
            it("get /api/list", function (done) {
                chai.request(server)
                .get("/api/list")
                .end(function (err, res) {
                    res.status.should.equal(401);
                    done();
                });
            });
            it("get /api/data?overTimeData10mins", function (done) {
                chai.request(server)
                .get("/api/data?overTimeData10mins")
                .end(function (err, res) {
                    if (err)
                        done(err);
                    res.status.should.equal(200);
                    done();
                });
            });
            it("get /api/data?summary", function (done) {
                chai.request(server)
                .get("/api/data?summary")
                .end(function (err, res) {
                    if (err)
                        done(err);
                    res.status.should.equal(200);
                    done();
                });
            });
        });
    });
});
