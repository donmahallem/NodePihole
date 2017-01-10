const crypto = require("crypto");

var helper = {};

// creates the default hash of the password for the admin panel
helper.hashPassword = function(pwd) {
    const tempHash = crypto.createHash("sha256", "utf8").update(pwd).digest("hex");
    return crypto.createHash("sha256", "utf8").update(tempHash).digest("hex");
};

module.exports = helper;
