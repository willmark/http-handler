/**
 * Handles reading a resource file and piping the results to response stream
 * file - path to the resources
 * req - http request
 * res - http response
 */
module.exports = function(req, res) {
    fs = require("fs");
    url = require("url");
    reqpath = url.parse(req.url).pathname;
    file = path.join(resources, reqpath);
    rs = require("fs").createReadStream(file);
    rs.pipe(res);
    rs.on("error", function(errpipe) {
        console.error(errpipe);
        throw errpipe;
    });
    res.writeHead(200, {
        "Content-Type": "text/plain"
    });
    rs.on("end", function() {
        res.end();
    });
};