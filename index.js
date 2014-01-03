path = require("path");

fs = require("fs");

modulepfx = path.dirname(module.filename) + path.sep;

responsesdefault = modulepfx + "responses";

resourcesdefault = modulepfx + "resources";

responses = responsesdefault;

resources = resourcesdefault;

/**
 * Validate file exists
 * usage:
 *     file - String path of file to check
 */
function isValidFile(file) {
    try {
        return fs.statSync(file).isFile();
    } catch (err) {
        return false;
    }
}

/**
 * Validate directory exists
 * usage:
 *     dir - String path of directory to check
 */
function isValidDir(dir) {
    try {
        return fs.statSync(dir).isDirectory();
    } catch (err) {
        return false;
    }
}

/**
 * Join resources root folder to requested sub-directory
 * id - sub-folder path
 * req - http request http.IncomingMessage
 * res - http response http.ServerResponse
 */
resource = function(filepath, req, res) {
    parentfile = path.resolve(path.join(resources, filepath));
    if (isValidFile(parentfile)) {
        if (isValidFile(path.join(resources, "index.js"))) {
            //Parent module resource handler exists.
            require(resources)(req, res);
            return true;
        } else {
            //Default resource handler
            require(resourcesdefault)(req, res);
            return true;
        }
    } else {
        return false;
    }
};

/**
 * Join responses root folder to requested sub-directory
 * id - sub-folder path
 * req - http request http.IncomingMessage
 * res - http response http.ServerResponse
 */
response = function(filepath, req, res) {
    parentdir = path.resolve(path.join(responses, filepath));
    defaultdir = path.resolve(path.join(responsesdefault, filepath));
    result = false;
    if (isValidDir(parentdir) && isValidFile(path.join(parentdir, "index.js"))) {
        //Parent module response handler exists.
        require(parentdir)(req, res);
        result = true;
    } else if (isValidDir(defaultdir) && isValidFile(path.join(defaultdir, "index.js"))) {
        //Default response handler
        require(defaultdir)(req, res);
        result = true;
    }
    return result;
};

/**
 * Default hook behavior for response followup
 */
defaultCallback = function(statusCode, err) {
    //Can put different logging levels in parent callback
};

/**
 * Exports the respond function to handling http responses
 *
 * A http server listening for requests (see nodejs server.listen),
 * can forward the req and res objects to this handler's respond(req, res, cb)
 * function to look for either file resources or handlers for a requested url.
 * Handlers are index.js node modules within the directory structure indicated
 * on the req.url relative path.
 *
 * config - configuration options
 *     responses - full directory path to responses handling folder
 *     resources - full directory path to resources (ie. images, video, etc.)
 */
module.exports = {
    /**
     * Initialize the module with two base directory paths identified in config object.
     * config {
     *   responses: <Base directory location for node module handlers>
     *   resources: <Base directory location for static file resources (ie. images, video, css)>
     * }
     */
    init: function(config) {
        config = config || {};
        responses = config.responses || responsesdefault;
        resources = config.resources || resourcesdefault;
        return module.exports;
    },
    /**
     * Respond to http request 
     * req - http request http.IncomingMessage
     * res - http response http.ServerResponse
     * callback - Callback function(statusCode, err)
     *    statusCode - http status response sent to client
     *    err - Any internal Error encountered such as an exeption thrown in response module
     */
    respond: function(req, res, callback) {
        callback = callback || defaultCallback;
        fs = require("fs");
        url = require("url");
        reqpath = url.parse(req.url).pathname;
        //strip out the query to search path/file
        //First, check if it is a valid resource file, and return it from the resources directory
        try {
            if (!resource(reqpath, req, res) && !response(reqpath, req, res)) {
                //require(path.join(responsesdefault, "404"))(req, res);
                response("404", req, res);
                callback(404);
            } else {
                callback(res.statusCode);
            }
        } catch (err) {
            //require(path.join(responsesdefault, "500"))(req, res);
            response("500", req, res);
            callback(500, err);
        }
        return module.exports;
    }
};
