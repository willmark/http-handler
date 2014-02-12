
/**
 * Validate file exists
 * usage:
 *     file - String path of file to check
 */
function isValidFile(file) {
    var fs = require("fs");
    try {
        return fs.statSync(file).isFile();
    } catch (err) {
        return false;
    }
}

/**
 * Handles reading a resource file and piping the results to response stream
 * file - path to the resources
 * req - http request
 * res - http response
 */
module.exports = function(req, res) {
    var fs = require("fs"),
        path = require("path"),
        url = require("url"),
        config =  module.parent.exports.config,
        reqpath = url.parse(req.url).pathname,
        file = path.join(config.resources, reqpath);
    if (isValidFile(file)) {
      res.writeHead(200, {
          "Content-Type": "text/plain"
      });
      rs = require("fs").createReadStream(file);
      rs.pipe(res);
      rs.on("error", function(errpipe) {
        console.error(errpipe);
        throw errpipe;
      });
      rs.on("end", function() {
        res.end();
      });
    } else {
      res.writeHead(404, {
          "Content-Type": "text/plain"
      });
      res.end(req.url + ' not found');
    }
};
