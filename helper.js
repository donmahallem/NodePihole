const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const appDefaults = require("./defaults.js");
const cookieSplitter = require("cookie");
const cookieParser = require("cookie-parser");
const os = require("os");
const setupVars = require("./setupVars.js");
var helper = {};
// creates the default hash of the password for the admin panel
helper.hashPassword = function(pwd) {
    const tempHash = crypto.createHash("sha256", "utf8")
        .update(pwd)
        .digest("hex");
    return crypto.createHash("sha256", "utf8")
        .update(tempHash)
        .digest("hex");
};

helper.express = {};

helper.express.verifyAuthCookie = function(req, res, next) {
    if (req.signedCookies.auth) {
        helper.jwtVerify(req.signedCookies.auth, function(err, decoded) {
            if (decoded) {
                req.user = {
                    "authenticated": true,
                    "token": req.signedCookies.auth
                };
            } else {
                req.user = {
                    "authenticated": false
                };
            }
            next();
        });
    } else {
        req.user = {
            "authenticated": false
        };
        next();
    }
};

helper.express.corsMiddleware = function(req, res, next) {
    const ipv4 = setupVars.hasOwnProperty("IPV4_ADDRESS") ? setupVars["IPV4_ADDRESS"].split("\/")[0] : server.address()
        .address;
    const authorizedHostnames = [
        ipv4,
        os.hostname(),
        "pi.hole",
        "localhost",
        "127.0.0.1"
    ];
    if (process.env.VIRTUAL_HOST) {
        authorizedHostnames.push(process.env.VIRTUAL_HOST);
    }
    var serverHost = req.hostname;
    if (serverHost && authorizedHostnames.indexOf(serverHost) === -1) {
        res.sendStatus(401);
        return;
    }
    if (req.headers.origin) {
        var originHeader = req.headers.origin;
        if (originHeader.indexOf(":") >= 0) {
            originHeader = originHeader.split(":")[0];
        }
        if (authorizedHostnames.indexOf(originHeader) === -1) {
            res.sendStatus(401);
            return;
        }
        res.set("Access-Control-Allow-Origin", req.headers.origin);
    }
    next();

};

helper.socketIo = {};
helper.socketIo.authMiddleware = function(socket, next) {
    if (socket.request.headers.cookie) {
        var cookies = cookieParser.signedCookies(cookieSplitter.parse(socket.request.headers.cookie), appDefaults.cookieSecret);
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
};
helper.jwtVerify = function(token, callback) {
    jwt.verify(token, appDefaults.jwtSecret, {
        "subject": "admin",
        "issuer": "pihole",
        "audience": "piholeuser"
    }, callback);
};
module.exports = helper;
