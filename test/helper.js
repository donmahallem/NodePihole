process.env.NODE_ENV = "test";
const chai = require("chai");
const sinon = require("sinon");
const should = chai.should();
const expect = chai.expect;
const logHelper = require("./../logHelper.js");
const appDefaults = require("./../defaults.js");
const moment = require("moment");
const readline = require("readline");
var sandbox;
const sourceTimestampFormat = "MMM DD hh:mm:ss"
const sourceTimestamp = moment()
    .format(sourceTimestampFormat);
const helper = require("./../helper.js");
const usedTimestamp = {
    "iso": moment(sourceTimestamp, sourceTimestampFormat)
        .toISOString(),
    "source": sourceTimestamp
};
describe("helper tests", function() {
    before(function() {
        sandbox = sinon.sandbox.create();
        // as stubing the default function of moment.js is tricky I will go this way

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
    });
});
