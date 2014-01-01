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

var handler = require("./index");
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
exports.filesSameNoCopy = function(a) {
    http.createServer(function(req, res) {
        console.log('responding to req ' + req.url);
        handler.respond(req, res);
        http.close();
        a.ok();
        a.done();
    }).listen(port, host) {
        console.log('listening on ' + http.address());
        http.get(http.address(), function(res) {
            console.log('resp is ' + res);
        }); 
    });
    
    a.expect(1);
};
