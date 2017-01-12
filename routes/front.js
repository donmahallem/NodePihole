const express = require("express");
const helper = require("./../helper.js");
const jwt = require("jsonwebtoken");
const appDefaults = require("./../defaults.js");

var frontEnd = {
    queries: {
        get(req, res) {
            if (req.user.authenticated) {
                res.render("queries_layout.pug", {
                    PCONFIG: {
                        boxedLayout: false,
                        wrongPassword: false,
                        authenticated: req.user.authenticated,
                        activePage: "queries"
                    }
                });
            } else {
                res.status(401);
                res.render("login_layout.pug", {
                    PCONFIG: {
                        boxedLayout: false,
                        wrongPassword: false,
                        authenticated: false,
                        activePage: "login"
                    }
                });
            }
        }
    },
    settings: {
        get(req, res) {
            if (req.user.authenticated) {
                res.render("settings_layout.pug", {
                    PCONFIG: {
                        boxedLayout: false,
                        wrongPassword: false,
                        authenticated: req.user.authenticated,
                        activePage: "queries"
                    }
                });
            } else {
                res.status(401);
                res.render("login_layout.pug", {
                    PCONFIG: {
                        boxedLayout: false,
                        wrongPassword: false,
                        authenticated: false,
                        activePage: "login"
                    }
                });
            }
        }
    },
    taillog: {
        get(req, res) {
            if (req.user.authenticated) {
                res.render("taillog_layout.pug", {
                    PCONFIG: {
                        boxedLayout: false,
                        wrongPassword: false,
                        authenticated: req.user.authenticated,
                        activePage: "queries"
                    }
                });
            } else {
                res.status(401);
                res.render("login_layout.pug", {
                    PCONFIG: {
                        boxedLayout: false,
                        wrongPassword: false,
                        authenticated: false,
                        activePage: "login"
                    }
                });
            }
        }
    },
    login: {
        get(req, res) {
            res.render("login_layout.pug", {
                PCONFIG: {
                    boxedLayout: false,
                    wrongPassword: false,
                    authenticated: req.user.authenticated,
                    activePage: "login"
                }
            });
        },
        post(req, res) {
            var token = req.body.pw;
            if (token) {
                var tokenHash = helper.hashPassword(token);
                if (tokenHash === req.app.locals.piHoleConfig.WEBPASSWORD) {
                    jwt.sign({
                            foo: "bar"
                        }, appDefaults.jwtSecret, {
                            expiresIn: "1h",
                            subject: "admin",
                            issuer: "pihole",
                            audience: "piholeuser"
                        },
                        function(err, token) {
                            if (token) {
                                res.cookie("auth", token, {
                                    expires: new Date(Date.now() + 60 * 60 * 1000),
                                    httpOnly: true,
                                    signed: true
                                });
                                res.redirect("/home");
                            } else {
                                res.render("login_layout.pug", {
                                    PCONFIG: {
                                        boxedLayout: false,
                                        wrongPassword: false,
                                        authenticated: false,
                                        activePage: "login"
                                    }
                                });
                            }
                        });
                    return;
                } else {
                    res.status(401);
                }
            } else {
                res.status(400);
            }
            res.render("login_layout.pug", {
                PCONFIG: {
                    boxedLayout: false,
                    wrongPassword: true,
                    authenticated: req.user.authenticated,
                    activePage: "login"
                }
            });
        }
    },
    list: {
        get(req, res) {
            if (!req.user.authenticated) {
                res.redirect("/login");
                return;
            }
            if (req.query.l === "white") {
                res.render("list_layout.pug", {
                    PCONFIG: {
                        boxedLayout: false,
                        wrongPassword: false,
                        authenticated: req.user.authenticated,
                        activePage: "login",
                        listType: "white"
                    }
                });
            } else if (req.query.l === "black") {
                res.render("list_layout.pug", {
                    PCONFIG: {
                        boxedLayout: false,
                        wrongPassword: false,
                        authenticated: req.user.authenticated,
                        activePage: "login",
                        listType: "black"
                    }
                });
            } else {
                res.render("list_layout.pug", {
                    PCONFIG: {
                        boxedLayout: false,
                        wrongPassword: false,
                        authenticated: req.user.authenticated,
                        activePage: "login",
                        listType: "unknown"
                    }
                });
            }
        }
    },
    logout: {
        get(req, res) {
            res.clearCookie("auth");
            res.redirect("/home");
        }
    },
    home: {
        get(req, res) {
            res.render("main_layout.pug", {
                PCONFIG: {
                    boxedLayout: false,
                    wrongPassword: false,
                    authenticated: req.user.authenticated,
                    activePage: "home"
                }
            });
        }
    }
};
module.exports = frontEnd;
