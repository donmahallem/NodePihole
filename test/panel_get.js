process.env.NODE_ENV = "test";

var chai = require("chai");
var chaiHttp = require("chai-http");
var server = require("../index");
var should = chai.should();

chai.use(chaiHttp);

describe("Checking Gets", function () {
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
    it("get /api/list", function (done) {
        chai.request(server)
        .get("/api/list")
        .end(function (err, res) {
			res.status.should.equal(401);
            if (err){
                done(err);
			}else{
				done();
			}
        });
    });
});
