const express = require("express");
const helper = require("./../helper.js");
const jwt = require("jsonwebtoken");
const appDefaults = require("./../defaults.js");
const setupVars=require("./../setupVars.js");

var frontEnd = {
    queries: {
        get(req, res) {
            if (req.user.authenticated) {
                res.render("queries_layout.pug", {
                    PCONFIG: {
                        boxedLayout: false,
                        wrongPassword: false,
                        user: req.user,
                        activePage: "queries"
                    }
                });
            } else {
                res.status(401);
                res.render("login_layout.pug", {
                    PCONFIG: {
                        boxedLayout: false,
                        wrongPassword: false,
                        user: req.user,
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
                        user: req.user,
                        activePage: "queries"
                    }
                });
            } else {
                res.status(401);
                res.render("login_layout.pug", {
                    PCONFIG: {
                        boxedLayout: false,
                        wrongPassword: false,
                        user: req.user,
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
                        user: req.user,
                        activePage: "queries"
                    }
                });
            } else {
                res.status(401);
                res.render("login_layout.pug", {
                    PCONFIG: {
                        boxedLayout: false,
                        wrongPassword: false,
                        user: req.user,
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
                    user: req.user,
                    activePage: "login"
                }
            });
        },
        post(req, res) {
            var token = req.body.pw;
            if (token) {
                var tokenHash = helper.hashPassword(token);
                if (tokenHash === setupVars.WEBPASSWORD) {
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
                                        user: req.user,
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
                    user: req.user,
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
                        user: req.user,
                        activePage: "login",
                        listType: "white"
                    }
                });
            } else if (req.query.l === "black") {
                res.render("list_layout.pug", {
                    PCONFIG: {
                        boxedLayout: false,
                        wrongPassword: false,
                        user: req.user,
                        activePage: "login",
                        listType: "black"
                    }
                });
            } else {
                res.render("list_layout.pug", {
                    PCONFIG: {
                        boxedLayout: false,
                        wrongPassword: false,
                        user: req.user,
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
                    user: req.user,
                    activePage: "home"
                }
            });
        }
    }
};
module.exports = frontEnd;
