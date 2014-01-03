http-handler
============

> Stability - 2 Unstable

A bare bones http handler for incoming server requests
from http.createServer(function (req, res) {});

The handler splits the request into two basic types.
Either the request is handled as a file resource, or
a module directory (see http://nodejs.org/api/modules.html).
The init() function takes an object with the base directories
for resources and response modules.  These should be different
directories to avoid the possiblity of piping a server-side
script file to the client.  See init() API description below.

The handler first looks for a file resource matching the url path
(ignoring any query strings).  Then, it looks for a matching
module handler.

A response module handler can be an index.js within the pathname
of the request url.  For example, if the request url
is /css/style.css, and there is a file resource located
in <resources directory>/css/style.css, the default behavior
is to pipe the file resource contents to the response.
Or, if there is a directory named <responses directory>/css/style.css/
containing index.js, that directory is loaded as a module
resource, and is expected to handle the incoming request.
An example index.js module resource might look like this:

/**
 * Default style.css handler
 */
module.exports = function (req, res) {
    res.writeHead(200, {
        "Content-Type": "text/plain"
    });
    res.write("body{ background-color:#d0e4fe; }");
    res.end();
};

If neither a resource exists, nor a module, there is a default 
<http-handler root directory>/responses/404/index.js
where responds with a generic 404 message.  The parent module
can create a similar 404 module to respond with a specific 404 message,
or create a <parent resources directory>/resources/404 file to respond
with a static message.
 
## API

````
//install
npm install http-handler

//usage
handler = require('http-handler');
handler.init([{
    responses: <directory path to response handlers>,
    resources: <directory path to resources (ex. images, videos, static html)>
}]);

handler.respond(req, res, callback);

/**
 * Initialize the module with two base directory paths identified in config object.
 * config {
 *   responses: <Base directory location for node module handlers>
 *   resources: <Base directory location for static file resources (ie. images, video, css)>
 * }
 */
init: function(config) 

/**
 * Respond to http request 
 * req - http request http.IncomingMessage
 * res - http response http.ServerResponse
 * callback - Callback function(statusCode, err)
 *    statusCode - http status response sent to client
 *    err - Any internal Error encountered such as an exeption thrown in response module
 */
respond: function(req, res, callback)

example:

handler = require('./index').init({
    resources: './parentresources',
    responses: './parentresponses'
});

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

````
