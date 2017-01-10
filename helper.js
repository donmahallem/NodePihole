const crypto = require("crypto");

var helper = {};

helper.hashPassword = function(pwd) {
    hash1 = crypto.createHash("sha256", "utf8").update(pwd).digest("hex");
    return crypto.createHash("sha256", "utf8").update(hash1).digest("hex");
};

module.exports = helper;
