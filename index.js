
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
 * Validate directory exists
 * usage:
 *     dir - String path of directory to check
 */
function isValidDir(dir) {
    var fs = require("fs");
    try {
        return fs.statSync(dir).isDirectory();
    } catch (err) {
        return false;
    }
}

/**
 * Join responses root folder to requested sub-directory
 * id - sub-folder path
 * req - http request http.IncomingMessage
 * res - http response http.ServerResponse
 */
var response = function(filepath, req, res) {
    var path = require("path"),
        config = module.exports.config,
        result = false,
        parentdir;
    do {
        var defaultdir = path.resolve(path.join(config.responsesdefault, filepath));
        parentdir = path.resolve(path.join(config.responses, filepath));
        if (isValidDir(parentdir) && isValidFile(path.join(parentdir, "index.js"))) {
            //Parent module response handler exists.
            require(parentdir)(req, res);
            result = true;
        } else if (isValidDir(defaultdir) && isValidFile(path.join(defaultdir, "index.js"))) {
            //Default response handler
            require(defaultdir)(req, res);
            result = true;
        }
        if (filepath === path.sep) break;
        filepath = path.dirname(filepath);
    } while (result === false && parentdir !== filepath);
    return result;
};

/**
 * Default hook behavior for response followup
 */
var defaultCallback = function(statusCode, err) {};

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
        var path = require("path"),
            modulepfx = path.dirname(module.filename),
            responsesdefault = path.join(modulepfx, "responses"),
            resourcesdefault = path.join(modulepfx, "resources");
        
        config = config || {};
        config.resources = config.resources || resourcesdefault;
        config.responses = config.responses || responsesdefault;
        config.responsesdefault = responsesdefault;
        config.resourcesdefault = resourcesdefault;
        this.config = config;
        return this;
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
        var fs = require("fs"),
            url = require("url"),
            reqpath = url.parse(req.url).pathname;
        //strip out the query to search path/file
        //First, check if it is a valid resource file, and return it from the resources directory
        try {
            if (!response(reqpath, req, res)) {
                response("404", req, res);
                callback(404);
            } else {
                callback(res.statusCode);
            }
        } catch (err) {
            response("500", req, res);
            callback(500, err);
        }
        return this;
    }
};
