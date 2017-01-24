module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        apidoc: {
            serverapi: {
                src: "./server/",
                dest: "./docs/"
            }
        },
        jsbeautifier: {
            files: ["server/**/*.js",
                "server/**/*.json",
                "!node_modules/**",
                "!server/**/vendor/**"
            ],
            options: {
                js: {
                    breakChainedMethods: true,
                    indentChar: " ",
                    indentSize: 4,
                    indentWithTabs: false,
                    jslintHappy: false,
                    maxPreserveNewlines: 2,
                    preserveNewlines: true,
                    endWithNewline: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-apidoc');
    grunt.loadNpmTasks("grunt-jsbeautifier");

    grunt.registerTask('default', ['apidoc', "jsbeautifier"]);

};
