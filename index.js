var serveStatic = require("serve-static");
var app = require("express")();
var server = require("http").Server(app);
var io = require("socket.io")(server);
const crypto = require("crypto");
var jwt = require("jsonwebtoken");
var bodyParser = require("body-parser");
const fs = require("fs");
const ini = require("ini");
const cookieParser = require("cookie-parser");
const spawn = require("child_process").spawn;
const exec = require("child_process").exec;
const readline = require("readline");
const moment = require("moment");

var DEFAULTS=require("./defaults.js");

app.set("view engine", "pug");
app.use(bodyParser.urlencoded({
        extended : true
    }));

function cr(pwd) {
    hash1 = crypto.createHash("sha256", "utf8").update(pwd).digest("hex");
    return crypto.createHash("sha256", "utf8").update(hash1).digest("hex");
}

var CONFIG = ini.parse(fs.readFileSync(DEFAULTS.setupVars, "utf-8"));

var secret = cr(cr(cr("" + (Math.random() * Date.now()))));
var cookieSecret = cr(cr(cr("" + (Math.random() * Date.now())) + secret));

app.use("/static", serveStatic(__dirname + "/static"))
app.use(cookieParser(cookieSecret))

app.use(function (req, res, next) {
    if (req.signedCookies.auth) {
        jwt.verify(req.signedCookies.auth, "secret", {
            subject : "admin",
            issuer : "pihole",
            audience : "piholeuser"
        }, function (err, decoded) {
            if (decoded) {
                req.user = {
                    authenticated : true
                };
            } else {
                req.user = {
                    authenticated : false
                };
            }
            next();
        });
    } else {
        req.user = {
            authenticated : false
        };
        next();
    }
});

app.get("/api/data", function (req, res) {
    if ("summary" in req.query) {
        var testData = {
            ads_blocked_today : 10,
            dns_queries_today : 200,
            ads_percentage_today : 10.2,
            domains_being_blocked : 20
        };
        res.json(testData);
    }
    if (req.query.summaryRaw !== undefined) {
        res.write("BBBBB");
    }
    if (req.query.overTimeData !== undefined) {}
    if ("overTimeData10mins" in req.query) {
        var lineReader = require("readline").createInterface({
                input : require("fs").createReadStream(DEFAULTS.logFile)
            });
        var data = {
            domains_over_time : {},
            ads_over_time : {}

        };
        lineReader.on("line", function (line) {
            if (typeof line === "undefined" || line.trim() === "" || line.indexOf(": query[A") === -1) {
                return;
            }
            var time = moment(line.substring(0, 16), "MMM DD hh:mm:ss");
            var hour = time.hour();
            var minute = time.minute();
            time = (minute - minute % 10) / 10 + 6 * hour;
            if (Math.random() < 0.5) {
                if (time in data.ads_over_time) {
                    data.ads_over_time[time]++;
                } else {
                    data.ads_over_time[time] = 1;
                }
            }
            if (time in data.domains_over_time) {
                data.domains_over_time[time]++;
            } else {
                data.domains_over_time[time] = 1;
            }
        });
        lineReader.on("close", function () {
            res.json(data);
        });
    }
    if (req.query.topItems !== undefined) {}
    if (req.query.recentItems !== undefined) {}
    if (req.query.getQueryTypes !== undefined) {}
    if (req.query.getForwardDestinations !== undefined) {}
    if (req.query.getQuerySources !== undefined) {}
    if ("getAllQueries" in req.query) {
        var lineReader = require("readline").createInterface({
                input : require("fs").createReadStream(DEFAULTS.logFile)
            });
        var lines = [];
        lineReader.on("line", function (line) {
            if (typeof line === "undefined" || line.trim() === "" || line.indexOf(": query[A") === -1) {
                return;
            } else {
                var _time = line.substring(0, 16);
                var expl = line.trim().split(" ");
                var _domain = expl[expl.length - 3];
                var tmp = expl[expl.length - 4];
                var _status = Math.random() < 0.5 ? "Pi-holed" : "OK"
                    var _type = tmp.substring(6, tmp.length - 1);
                var _client = expl[expl.length - 1];
                var data = {
                    time : moment(_time, "MMM DD hh:mm:ss").toISOString(),
                    domain : _domain,
                    status : _status,
                    type : _type,
                    client : _client
                };

                lines.push(data);
            }
        });
        lineReader.on("close", function () {
            res.json({
                data : lines
            });
        });
    }
});
app.get("/api/list", function (req, res) {
    if (!req.user.authenticated) {
        res.sendStatus(401);
        return;
    }
    if ("list" in req.query && (req.query.list === "white" || req.query.list === "black")) {
        const filepath = "/etc/pihole/" + req.query.list + "list.txt";
        fs.access(filepath, fs.constants.F_OK | fs.constants.R_OK, function (err) {
            if (err) {
                res.sendStatus(500);
            } else {
                lines = [];
                var lineReader = require("readline").createInterface({
                        input : require("fs").createReadStream("/etc/pihole/" + req.query.list + "list.txt")
                    });
                lineReader.on("line", function (line) {
                    if (line === undefined || line === "") {
                        return;
                    }
                    lines.push(line);
                });
                lineReader.on("close", function () {
                    res.json(lines);
                });
            }
        });
    } else {
        res.sendStatus(404);
    }
});

app.post("/scripts/pi-hole/php/add.php", function (req, res) {
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
app.get("/queries", function (req, res) {
    if (req.user.authenticated) {
        res.render("queries_layout.pug", {
            PCONFIG : {
                boxedLayout : false,
                wrongPassword : false,
                authenticated : req.user.authenticated,
                activePage : "queries"
            }
        })
    } else {
        console.log("Unauthorized request to /queries");
        res.redirect("/login");
    }
});
app.get("/login", function (req, res) {
    res.render("login_layout.pug", {
        PCONFIG : {
            boxedLayout : false,
            wrongPassword : false,
            authenticated : req.user.authenticated,
            activePage : "login"
        }
    })
});
app.get("/list", function (req, res) {
    if (!req.user.authenticated) {
        res.redirect("/login");
        return;
    }
    if (req.query.l === "white") {
        res.render("list_layout.pug", {
            PCONFIG : {
                boxedLayout : false,
                wrongPassword : false,
                authenticated : req.user.authenticated,
                activePage : "login",
                listType : "white"
            }
        });
    } else if (req.query.l === "black") {
        res.render("list_layout.pug", {
            PCONFIG : {
                boxedLayout : false,
                wrongPassword : false,
                authenticated : req.user.authenticated,
                activePage : "login",
                listType : "black"
            }
        });
    } else {
        res.render("list_layout.pug", {
            PCONFIG : {
                boxedLayout : false,
                wrongPassword : false,
                authenticated : req.user.authenticated,
                activePage : "login",
                listType : "unknown"
            }
        });
    }
});
app.get("/logout", function (req, res) {
    res.clearCookie("auth");
    res.redirect("/home");
});
app.get("/", function (req, res) {
    res.render("main_layout.pug", {
        PCONFIG : {
            boxedLayout : false,
            wrongPassword : false,
            authenticated : req.user.authenticated,
            activePage : "home"
        }
    })
});
app.get("/home", function (req, res) {
    res.render("main_layout.pug", {
        PCONFIG : {
            boxedLayout : false,
            wrongPassword : false,
            authenticated : req.user.authenticated,
            activePage : "home"
        }
    })
});
app.post("/login", function (req, res) {
    var token = req.body.pw;
    if (token) {
        tokenHash = cr(token);
        if (tokenHash === CONFIG.WEBPASSWORD) {
            jwt.sign({
                foo : "bar"
            }, "secret", {
                expiresIn : "1h",
                subject : "admin",
                issuer : "pihole",
                audience : "piholeuser"
            },
                function (err, token) {
                if (token) {
                    res.cookie("auth", token, {
                        expires : new Date(Date.now() + 60 * 60 * 1000),
                        httpOnly : true,
                        signed : true
                    });
                    res.redirect("/home");
                } else {
                    console.log("error occured");
                    res.render("login_layout.pug", {
                        PCONFIG : {
                            boxedLayout : false,
                            wrongPassword : false,
                            authenticated : false,
                            activePage : "login"
                        }
                    })
                }
            });
            return;
        }
    }
    res.render("login_layout.pug", {
        PCONFIG : {
            boxedLayout : false,
            wrongPassword : true,
            authenticated : req.user.authenticated,
            activePage : "login"
        }
    })
});

app.listen(3000, function () {
    console.log("Example app listening on port 3000!")
});

module.exports = app;
