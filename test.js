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

handler = require("./index");
server = http.createServer(function(req, res) {
    handler.respond(req, res);
});
/*
exports.noArgsFails = function(a) {
    a.expect(1);
    a.throws(function() {
        handler.respond();
    }, "OK");
    a.done();
};

exports.badCallbackFails = function(a) {
    http.createServer(function(req, res) {
        handler.respond(req, res);
        http.close();
    }).listen(port, host);
    a.expect(1);
    a.throws(function() {
        handler.respond();
    }, /Callback required/);
    a.done();
};
*/
exports.homeOK = function(a) {
    server.listen(port, host, function() {
        a.expect(1);
        http.get(server.address(), function(res) {
            res.on('data', function (chunk) {
                server.close();
                a.ok(chunk.toString() === 'home requested: /');
                a.done();
            });
        }); 
    });
};

exports.resourceOK = function(a) {
    server.listen(port, host, function() {
        a.expect(1);
        address = server.address();
        address.path = "/file1";
        http.get(address, function(res) {
            res.on('data', function (chunk) {
                server.close();
                a.ok(chunk.toString() === 'contents of file1');
                a.done();
            });
        }); 
    });
};

exports.response404 = function(a) {
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

exports.response500 = function(a) {
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
