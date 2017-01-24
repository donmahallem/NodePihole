module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg : grunt.file.readJSON("package.json"),
        apidoc : {
            serverapi : {
                src : "./server/",
                dest : "./docs/"
            }
        },
        jsbeautifier : {
            files : ["server/**/*.js",
                "server/**/*.json",
                "!node_modules/**",
                "!server/**/vendor/**"
            ],
            options : {
                js : {
                    breakChainedMethods : true,
                    indentChar : " ",
                    indentSize : 4,
                    indentWithTabs : false,
                    jslintHappy : false,
                    maxPreserveNewlines : 2,
                    preserveNewlines : true,
                    endWithNewline : true
                }
            }
        },
        uglify : {
            adminpanel : {
                options : {
                    banner : "/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today(' yyyy - mm - dd ') %> */\n",
                    mangle : false
                },
                files : [{
                        expand : true,
                        cwd : "server/static/scripts/pi-hole",
                        src : "**/*.js",
                        dest : "server/static/scripts/pi-hole",
                        ext : ".min.js"
                    }
                ]
            }
        }
    });

    grunt.loadNpmTasks("grunt-apidoc");
    grunt.loadNpmTasks("grunt-jsbeautifier");
    grunt.loadNpmTasks("grunt-contrib-uglify");

    grunt.registerTask("default", ["apidoc", "jsbeautifier", "uglify"]);

};
