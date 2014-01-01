/**
 * Handles reading a resource file and piping the results to response stream
 * resources - path to the resources folder as defined in the config options
 * req - http request
 * res - http response
 */
module.exports = function(resources, req, res) {
   res.writeHead(200, {'Content-Type': 'text/plain'});
   rs = require('fs').createReadStream(require('path').join(resources, req.url));
   rs.pipe(res);
   rs.on('error', function(errpipe) {
       console.error(errpipe);
       throw errpipe;
   });
   rs.on('end', function() {
       res.end();
   });
};
