const serveStatic = require("serve-static");
const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
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
const logHelper = require("./logHelper.js");
const csp = require("csp-header");
const appDefaults = require("./defaults.js");
const Tail = require("tail")
    .Tail;
/**
 * @class PiServer
 * @export PiServer
 */
var PiServer = function() {
    /** 
     * express app instance of the server
     *@member {Object} PiServer#app
     */
    this.app = express();
    /**
     * http instance of the server
     *@member {Object} PiServer#http
     */
    this.http = server(this.app);
    this.app.set("view engine", "pug");
    this.app.set('views', './server/views');
    this.app.use(bodyParser.urlencoded({
        extended: true
    }));
    this.app.use("/static", serveStatic(__dirname + "/static"));
    this.app.use(cookieParser(appDefaults.cookieSecret));
    this.app.use(function(req, res, next) {
        helper.express.corsMiddleware(req, res, next);
    }.bind(this));
    this.app.use(function(req, res, next) {
        helper.express.verifyAuthCookie(req, res, next);
    });
    this.app.use(function(req, res, next) {
        var cCsp = csp({
            policies: {
                "default-src": [csp.SELF],
                "script-src": [csp.SELF, csp.INLINE, csp.EVAL],
                "style-src": [csp.SELF, csp.INLINE],
                "img-src": [csp.SELF],
                "connect-src": [csp.SELF, "https://api.github.com", "ws:", "wss:"],
                //"worker-src": [csp.NONE],
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
    this.app.use(function(err, req, res, next) {
        console.log("Request errored", err);
    });

    this.started = false;
};

/**
 *  starts the server
 * @method PiServer#start
 */
PiServer.prototype.start = function() {
    if (!this.started) {
        this.started = true;
        this.http.listen(appDefaults.port, function() {
                console.log("Server listening on port " + appDefaults.port + "!");
            }
            .bind(this));
    }
};
module.exports = PiServer;
