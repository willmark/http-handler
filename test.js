var util = require("util");
var argv = require("optimist").argv;
var url = require("url");
var http = require("http");
var path = require("path");

var hostname = "localhost";
var hostport = "http://localhost:0";

hostport = url.parse(hostport);

//supports only http
var port = hostport.port;
var host = hostport.hostname;

handler = require("./index").init();
server = http.createServer(function(req, res) {
    handler.respond(req, res, function (statusCode, err) {
        switch (statusCode) {
            case 200:
                console.log('Completed request successfully: ' + req.url);
                break;
            case 403:
                console.warn('Forbidden: ' + req.url);
                break;
            case 404:
                console.warn('URL not found: ' + req.url);
                break;
            case 500:
                console.warn('500 error: ' + err);
                break;
            default:
                console.error('Unknown status: ' + statusCode);
                console.error('Unknown error: ' + err);
                break;
        }
    });
});

exports.defaultHomeOK = function(a) {
    server.listen(port, host, function() {
        a.expect(1);
        http.get(server.address(), function(res) {
            res.on('data', function (chunk) {
                server.close();
                a.ok(chunk.toString() === 'default home requested: /');
                a.done();
            });
        }); 
    });
};

exports.defaultResourceOK = function(a) {
    server.listen(port, host, function() {
        a.expect(1);
        address = server.address();
        address.path = "/file1";
        http.get(address, function(res) {
            res.on('data', function (chunk) {
                server.close();
                a.ok(chunk.toString() === 'default file1');
                a.done();
            });
        }); 
    });
};

exports.defaultResponse404 = function(a) {
    server.listen(port, host, function() {
        a.expect(2);
        address = server.address();
        address.path = "/file2";
        http.get(address, function(res) {
            res.on('data', function (chunk) {
                server.close();
                a.ok(res.statusCode === 404);
                a.ok(chunk.toString() === '/file2 not found');
                a.done();
            });
        }); 
    });
};

exports.defaultResponse500 = function(a) {
    server.listen(port, host, function() {
        a.expect(2);
        address = server.address();
        address.path = "/throwerror";
        http.get(address, function(res) {
            res.on('data', function (chunk) {
                server.close();
                a.ok(res.statusCode === 500);
                a.ok(chunk.toString() === '/throwerror unknown error');
                a.done();
            });
        }); 
    });
};

exports.parentDefaultResponse500 = function(a) {
    handler = require('./index').init({
        resources: './parentresources',
        responses: './parentresponses'
    });
    server.listen(port, host, function() {
        a.expect(2);
        address = server.address();
        address.path = "/throwerror";
        http.get(address, function(res) {
            res.on('data', function (chunk) {
                server.close();
                a.ok(res.statusCode === 500);
                a.ok(chunk.toString() === '/throwerror unknown error');
                a.done();
            });
        }); 
    });
};

exports.parentHomeOK = function(a) {
    handler = require('./index').init({
        resources: './parentresources',
        responses: './parentresponses'
    });
    server.listen(port, host, function() {
        a.expect(1);
        http.get(server.address(), function(res) {
            res.on('data', function (chunk) {
                server.close();
                a.ok(chunk.toString() === 'parent home requested: /');
                a.done();
            });
        }); 
    });
};

exports.parentResourceOK = function(a) {
    handler = require('./index').init({
        resources: './parentresources',
        responses: './parentresponses'
    });
    server.listen(port, host, function() {
        a.expect(2);
        address = server.address();
        address.path = "/file1";
        http.get(address, function(res) {
            res.on('data', function (chunk) {
                server.close();
                a.ok(res.statusCode === 200);
                a.ok(chunk.toString().trim() === 'parent file1');
                a.done();
            });
        }); 
    });
};

exports.parent403OK = function(a) {
    handler = require('./index').init({
        resources: './parentresources',
        responses: './parentresponses'
    });
    server.listen(port, host, function() {
        a.expect(2);
        address = server.address();
        address.path = "/403";
        http.get(address, function(res) {
            res.on('data', function (chunk) {
                server.close();
                a.ok(res.statusCode === 403);
                a.ok(chunk.toString().trim() === 'Forbidden: /403');
                a.done();
            });
        }); 
    });
};
