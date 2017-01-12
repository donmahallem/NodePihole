const serveStatic = require("serve-static");
const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const fs = require("fs");
const ini = require("ini");
const cookieParser = require("cookie-parser");
const spawn = require("child_process")
    .spawn;
const exec = require("child_process")
    .exec;
const server = require("http")
    .Server;
const readline = require("readline");
const moment = require("moment");
const apiRoute = require("./routes/api.js");
const frontEnd = require("./routes/front.js");
const helper = require("./helper.js");
const csp = require("csp-header");
const appDefaults = require("./defaults.js");
const Tail = require("tail")
    .Tail;
const socketioJwt = require("socketio-jwt");

var PiServer = function() {
    this.app = express();
    this.http = server(this.app);
    this.socketIo = {
        "io": socketIo(this.http)
    }
    this.app.set("view engine", "pug");
    this.app.use(bodyParser.urlencoded({
        extended: true
    }));

    this.app.use("/static", serveStatic(__dirname + "/static"));
    this.app.use(cookieParser(appDefaults.cookieSecret));

    this.app.use(function(req, res, next) {
        helper.verifyAuthCookie(req, res, next);
    });

    this.app.use(function(req, res, next) {
        var cCsp = csp({
            policies: {
                "default-src": [csp.SELF],
                "script-src": [csp.SELF, csp.INLINE],
                "style-src": [csp.SELF, csp.INLINE],
                "img-src": [csp.SELF],
                "connect-src": [csp.SELF, "https://api.github.com", "ws:", "wss:"],
                "worker-src": [csp.NONE],
                "block-all-mixed-content": true
            }
        });
        res.set("Content-Security-Policy", cCsp);
        next();
    });

    this.app.use("/api", apiRoute);
    this.app.get("/", frontEnd.home.get);
    this.app.get("/home", frontEnd.home.get);
    this.app.get("/settings", frontEnd.settings.get);
    this.app.get("/taillog", frontEnd.taillog.get);
    this.app.get("/login", frontEnd.login.get);
    this.app.post("/login", frontEnd.login.post);
    this.app.get("/logout", frontEnd.logout.get);
    this.app.get("/queries", frontEnd.queries.get);
    this.app.get("/list", frontEnd.list.get);

    this.app.post("/scripts/pi-hole/php/add.php", function(req, res) {
        if (!req.user.authenticated) {
            res.sendStatus(401);
            res.end();
            return;
        }
        var domain = req.body.domain;
        var list = req.body.list;
        var token = req.body.token;
        if (domain && list) {
            if (list === "white") {
                exec("sudo pihole -w -q " + domain);
                res.end();
                return;
            } else if (list === "black") {
                exec("sudo pihole -b -q " + domain);
                res.end();
                return;
            } else {
                console.log("unknwon list type:" + list);
            }
        }
        res.sendStatus(404);

    });

    // Socket IO setup
    // https://github.com/socketio/engine.io-client/pull/379
    this.socketIo.privateSocket = this.socketIo.io.of("/private");
    this.socketIo.publicSocket = this.socketIo.io.of("/public");
    this.socketIo.privateSocket.use(function(socket, next) {
        if (socket.request.headers.cookie) {
            cookie = require("cookie");
            cookies = cookieParser.signedCookies(cookie.parse(socket.request.headers.cookie), appDefaults.cookieSecret);
            if ("auth" in cookies) {
                helper.jwtVerify(cookies.auth, function(err, decoded) {
                    if (err) {
                        next(new Error("Authentication error"));
                    } else {
                        next();
                    }
                });
            } else {
                next(new Error("Authentication error"));
            }
        } else {
            console.log("No cookies");
            next(new Error("Authentication error"));
        }
    });
    this.socketIo.privateSocket.on("connection", function(socket) {
        console.log("an authenticated user connected, ");
        socket.on("disconnect", function() {
            console.log("an authenticated user disconnected");
        });
    });
    this.socketIo.publicSocket.on("connection", function(socket) {
        console.log("a user connected");
        socket.on("disconnect", function() {
            console.log("a user disconnected");
        });
    });
    this.started = false;
};

PiServer.prototype.load = function() {
    this.app.locals.piHoleConfig = ini.parse(fs.readFileSync(appDefaults.setupVars, "utf-8"));
};

PiServer.prototype.start = function() {
    if (!this.started) {
        this.started = true;
        this.http.listen(appDefaults.port, function() {
                console.log("Server listening on port " + appDefaults.port + "!");
            }
            .bind(this));
        var tail = new Tail(appDefaults.logFile);

        tail.on("line", function(data) {
            console.log(data);
            this.socketIo.privateSocket.emit("dnsevent", {
                "type": "deny",
                "domain": "test.com"
            });
            this.socketIo.publicSocket.emit("dnsevent", {
                "type": "deny"
            });
        }.bind(this));

        tail.on("error", function(error) {
            console.log("ERROR: ", error);
        });
    }
};

module.exports = PiServer;
