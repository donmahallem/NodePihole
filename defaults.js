/*
	THIS NEEDS SOME SERIOUS FIXING!!
	There has to be a better way!!
	*/
if (process.env.NODE_ENV !== "test") {
    module.exports = {
        logFile: "/var/log/pihole.log",
        setupVars: "/etc/pihole/setupVars.conf",
        whiteListFile: "/etc/pihole/whitelist.txt",
        blackListFile: "/etc/pihole/blacklist.txt",
        port: 3000,
        csrfSecret: "1b60cf9905e665d6306d466df97c2311fd9eccbd4371d656abe1c9d5d1261c17",
        jwtSecret: "236761d24ce20e1c6dde676068b52d6453bd3b25dccce51b4ddb6cd78bb1a557",
        cookieSecret: "c7f88711ba33773fee39fada7503f3f704d308f25a34987eb6a1b79f21c51ee0",
        gravityListFile: "/etc/pihole/list.preEventHorizon"
    };
} else {
    module.exports = {
        logFile: __dirname + "/test/pihole.log",
        setupVars: __dirname + "/test/setupVars.conf",
        whiteListFile: __dirname + "/test/whitelist.txt",
        blackListFile: __dirname + "/test/blacklist.txt",
        port: 3000,
        csrfSecret: "1b60cf9905e665d6306d466df97c2311fd9eccbd4371d656abe1c9d5d1261c17",
        jwtSecret: "236761d24ce20e1c6dde676068b52d6453bd3b25dccce51b4ddb6cd78bb1a557",
        cookieSecret: "c7f88711ba33773fee39fada7503f3f704d308f25a34987eb6a1b79f21c51ee0",
        gravityListFile: __dirname + "/test/list.preEventHorizon"
    };
}
