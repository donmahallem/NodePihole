const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const appDefaults = require("./defaults.js");
const cookieSplitter = require("cookie");
const cookieParser = require("cookie-parser");
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
helper.verifyAuthCookie = function(req, res, next) {
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
