/*
	THIS NEEDS SOME SERIOUS FIXING!!
	There has to be a better way!!
	*/

/**
 * Module containing app defaults that are loaded at start
 * @namespace appDefaults
 * @property {String}  logFile - The default number of players.
 * @property {String}  setupVars         - The default level for the party.
 * @property {String}  whiteListFile      - The default treasure.
 * @property {String}  blackListFile - How much gold the party starts with.
 * @property {Number}  port - How much gold the party starts with.
 * @property {String}  csrfSecret - How much gold the party starts with.
 * @property {String}  jwtSecret - How much gold the party starts with.
 * @property {String}  cookieSecret - How much gold the party starts with.
 * @property {String}  gravityListFile - How much gold the party starts with.
 */

const appDefaultsProd = {
    logFile: "/var/log/pihole.log",
    setupVars: "/etc/pihole/setupVars.conf",
    whitelistFile: "/etc/pihole/whitelist.txt",
    blacklistFile: "/etc/pihole/blacklist.txt",
    wildcardBlacklistFile: "/etc/dnsmasq.d/03-pihole-wildcard.conf",
    port: 3000,
    csrfSecret: "1b60cf9905e665d6306d466df97c2311fd9eccbd4371d656abe1c9d5d1261c17",
    jwtSecret: "236761d24ce20e1c6dde676068b52d6453bd3b25dccce51b4ddb6cd78bb1a557",
    cookieSecret: "c7f88711ba33773fee39fada7503f3f704d308f25a34987eb6a1b79f21c51ee0",
    gravityListFile: "/etc/pihole/list.preEventHorizon"
};
const appDefaultsTest = {
    logFile: __dirname + "/../test/pihole.log",
    setupVars: __dirname + "/../test/setupVars.conf",
    whitelistFile: __dirname + "/../test/whitelist.txt",
    blacklistFile: __dirname + "/../test/blacklist.txt",
    wildcardBlacklistFile: "/etc/dnsmasq.d/03-pihole-wildcard.conf",
    port: 3000,
    csrfSecret: "1b60cf9905e665d6306d466df97c2311fd9eccbd4371d656abe1c9d5d1261c17",
    jwtSecret: "236761d24ce20e1c6dde676068b52d6453bd3b25dccce51b4ddb6cd78bb1a557",
    cookieSecret: "c7f88711ba33773fee39fada7503f3f704d308f25a34987eb6a1b79f21c51ee0",
    gravityListFile: __dirname + "/../test/list.preEventHorizon"
};
module.exports = (process.env.NODE_ENV !== "test") ? appDefaultsProd : appDefaultsTest;
