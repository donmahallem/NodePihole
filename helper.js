const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const appDefaults = require("./defaults.js");
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
        jwt.verify(req.signedCookies.auth, appDefaults.jwtSecret, {
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
};

module.exports = helper;
