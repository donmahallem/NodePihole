process.env.NODE_ENV = "test";
const chai = require("chai");
const sinon = require("sinon");
const should = chai.should();
const expect = chai.expect;
const helper = require("./../helper.js");
const logHelper = require("./../logHelper.js");
var sandbox;
describe("logHelper tests", function() {
    before(function() {
        sandbox = sinon.sandbox.create();
    });
    afterEach(function() {
        sandbox.restore();
    });
    describe("parseLine()", function() {
        it("should parse query successfull", function() {
            const result = logHelper.parseLine("Jan 20 22:21:15 dnsmasq[503]: query[AAAA] aaaaaaaaaa.bbbbbb.ccccccccccc.net from 1111:1111:1111:1111:1111:1111:1111:1111");
            expect(result)
                .to.not.be.null;
            expect(result)
                .to.deep.equal({
                    domain: 'aaaaaaaaaa.bbbbbb.ccccccccccc.net',
                    timestamp: '2017-01-20T21:21:15.000Z',
                    client: '1111:1111:1111:1111:1111:1111:1111:1111',
                    type: 'query',
                    queryType: 'AAAA'
                });
        });
        it("should parse query successfull", function() {
            const result = logHelper.parseLine("Jan 14 22:21:15 dnsmasq[503]: query[AAAA] aaaaaaaaaa.bbbbbb.ccccccccccc.net from 127.0.0.1");
            expect(result)
                .to.not.be.null;
            expect(result)
                .to.deep.equal({
                    domain: 'aaaaaaaaaa.bbbbbb.ccccccccccc.net',
                    timestamp: '2017-01-14T21:21:15.000Z',
                    client: '127.0.0.1',
                    type: 'query',
                    queryType: 'AAAA'
                });
        });
        it("should parse query successfull", function() {
            const result = logHelper.parseLine("Jan 01 22:21:15 dnsmasq[503]: query[A] aaaaaaaaaa.bbbbbb.ccccccccccc.net from 1111:1111:1111:1111:1111:1111:1111:1111");
            expect(result)
                .to.not.be.null;
            expect(result)
                .to.deep.equal({
                    domain: 'aaaaaaaaaa.bbbbbb.ccccccccccc.net',
                    timestamp: '2017-01-01T21:21:15.000Z',
                    client: '1111:1111:1111:1111:1111:1111:1111:1111',
                    type: 'query',
                    queryType: 'A'
                });
        });
        it("should parse query successfull", function() {
            const result = logHelper.parseLine("Jan 12 22:21:15 dnsmasq[503]: query[A] aaaaaaaaaa.bbbbbb.ccccccccccc.net from 127.0.0.1");
            expect(result)
                .to.not.be.null;
            expect(result)
                .to.deep.equal({
                    domain: 'aaaaaaaaaa.bbbbbb.ccccccccccc.net',
                    timestamp: '2017-01-12T21:21:15.000Z',
                    client: '127.0.0.1',
                    type: 'query',
                    queryType: 'A'
                });
        });
        it("should return false for invalid line", function() {
            const result = logHelper.parseLine("bhn123 3124u 213h4021 34921u3 410ß4 109234 145rj1 0ß235125 1 ß15 u120ß95 1ß125 120i 4021ß5 u");
            expect(result)
                .to.not.be.null;
            expect(result)
                .to.be.false;
        });
        it("should return false for invalid line", function() {
            const result = logHelper.parseLine("reply aaaaaaaaaa.bbbbbb.ccccccccccc.net is 127.0.0.1");
            expect(result)
                .to.not.be.null;
            expect(result)
                .to.be.false;
        });
        it("should return block successfull", function() {
            const result = logHelper.parseLine("Jan 14 22:04:52 dnsmasq[503]: /etc/pihole/gravity.list aaaaaaaaaa.bbbbbb.ccccccccccc.net is 1111:1111:1111:1111:1111:1111:1111:1111");
            expect(result)
                .to.not.be.null;
            expect(result)
                .to.deep.equal({
                    domain: 'aaaaaaaaaa.bbbbbb.ccccccccccc.net',
                    timestamp: '2017-01-14T21:04:52.000Z',
                    list: '/etc/pihole/gravity.list',
                    type: 'block',
                });
        });
        it("should return block successfull", function() {
            const result = logHelper.parseLine("Jan 14 22:04:52 dnsmasq[503]: 1 2 /etc/pihole/gravity.list aaaaaaaaaa.bbbbbb.ccccccccccc.net is 1111:1111:1111:1111:1111:1111:1111:1111");
            expect(result)
                .to.not.be.null;
            expect(result)
                .to.deep.equal({
                    domain: 'aaaaaaaaaa.bbbbbb.ccccccccccc.net',
                    timestamp: '2017-01-14T21:04:52.000Z',
                    list: '/etc/pihole/gravity.list',
                    type: 'block',
                });
        });
        it("should return block successfull", function() {
            const result = logHelper.parseLine("Jan 14 22:04:52 dnsmasq[503]: 1 2 /etc/pihole/gravity.list aaaaaaaaaa.bbbbbb.ccccccccccc.net is 1111:1111:1111:1111:1111:1111:1111:1111");
            expect(result)
                .to.not.be.null;
            expect(result)
                .to.deep.equal({
                    domain: 'aaaaaaaaaa.bbbbbb.ccccccccccc.net',
                    timestamp: '2017-01-14T21:04:52.000Z',
                    list: '/etc/pihole/gravity.list',
                    type: 'block',
                });
        });
        it("should return false for invalid block line", function() {
            const result = logHelper.parseLine("Jan 14 22:04:52 dnsmasq[503]: 1 2 /etc/pihole/block.list aaaaaaaaaa.bbbbbb.ccccccccccc.net is 1111:1111:1111:1111:1111:1111:1111:1111");
            expect(result)
                .to.not.be.null;
            expect(result)
                .to.be.false;
        });
    });
});
