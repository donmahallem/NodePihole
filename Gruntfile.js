module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        apidoc: {
            serverapi: {
                src: "./server/",
                dest: "./docs/"
            }
        }
    });

    grunt.loadNpmTasks('grunt-apidoc');

    grunt.registerTask('default', ['apidoc']);

};
