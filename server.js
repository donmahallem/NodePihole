var serveStatic = require("serve-static");
var express = require("express");
const crypto = require("crypto");
var jwt = require("jsonwebtoken");
var socketIo = require("socket.io");
var bodyParser = require("body-parser");
const fs = require("fs");
const ini = require("ini");
const cookieParser = require("cookie-parser");
const spawn = require("child_process").spawn;
const exec = require("child_process").exec;
const readline = require("readline");
const moment = require("moment");
const apiRoute = require("./routes/api.js");
const frontEnd = require("./routes/front.js");

function cr(pwd) {
    hash1 = crypto.createHash("sha256", "utf8").update(pwd).digest("hex");
    return crypto.createHash("sha256", "utf8").update(hash1).digest("hex");
}

var PiServer = function() {
    this.app = express();
    this.server = require("http").Server(this.app);
    this.io = socketIo(this.server);
    this.app.set("view engine", "pug");
    this.app.use(bodyParser.urlencoded({
        extended: true
    }));

    var secret = cr(cr(cr("" + (Math.random() * Date.now()))));
    var cookieSecret = cr(cr(cr("" + (Math.random() * Date.now())) + secret));

    this.app.use("/static", serveStatic(__dirname + "/static"))
    this.app.use(cookieParser(cookieSecret))

    this.app.use(function(req, res, next) {
        if (req.signedCookies.auth) {
            jwt.verify(req.signedCookies.auth, "secret", {
                subject: "admin",
                issuer: "pihole",
                audience: "piholeuser"
            }, function(err, decoded) {
                if (decoded) {
                    req.user = {
                        authenticated: true
                    };
                } else {
                    req.user = {
                        authenticated: false
                    };
                }
                next();
            });
        } else {
            req.user = {
                authenticated: false
            };
            next();
        }
    });
    this.app.use("/api", apiRoute);
    this.app.get("/", frontEnd.home.get);
    this.app.get("/home", frontEnd.home.get);
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
};

PiServer.prototype.load = function() {
    this.app.locals.settings = require("./defaults.js");
    this.app.locals.piHoleConfig = ini.parse(fs.readFileSync(this.app.locals.settings.setupVars, "utf-8"));
};

PiServer.prototype.start = function() {
    this.app.listen(this.app.locals.settings.port, function() {
            console.log("Server listening on port " + this.app.locals.settings.port + "!")
        }
        .bind(this));
};

module.exports = PiServer;
