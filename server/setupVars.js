const ini = require("ini");
const fs = require("fs");
const appDefaults = require("./defaults.js");
module.exports = ini.parse(fs.readFileSync(appDefaults.setupVars, "utf-8"));
