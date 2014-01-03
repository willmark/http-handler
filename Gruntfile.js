module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        preprocess: {
            js: {
                src: "index.js",
                dest: "src-pp/index.js"
            }
        },
        jshint: {
            files: [ "*.js" ]
        },
        nodeunit: {
            all: [ "test.js" ]
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: "src-pp/**.js",
                dest: "dist/<%= pkg.name %>.min.js"
            }
        }
    });
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-nodeunit");
    grunt.loadNpmTasks("grunt-preprocess");
    grunt.registerTask("default", [ "jshint", "tests", "preprocess", "uglify" ]);
    grunt.registerTask([ "tests" ], "Unit testing", function() {
        grunt.file.write("./resources/file1", "default file1");//default resource
        grunt.file.write("./parentresources/file1", "parent file1");//parent module resource
        grunt.file.write("./responses/index.js", "module.exports = function(req, res) { res.writeHead(200, {'Content-Type': 'text/plain'}); res.write('default home requested: ' + req.url); res.end(); };");
        grunt.file.write("./parentresponses/index.js", "module.exports = function(req, res) { res.writeHead(200, {'Content-Type': 'text/plain'}); res.write('parent home requested: ' + req.url); res.end(); };");
        grunt.file.write("./responses/throwerror/index.js", "throw new Error('Default Error Test');");
        grunt.file.write("./parentresponses/throwerror/index.js", "throw new Error('Parent Error Test');");
        grunt.task.run("nodeunit");
    });
};
