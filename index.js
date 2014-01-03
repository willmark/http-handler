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
 * Exports the respond function to handling http responses
 * config - configuration options
 *     responses - full directory path to responses handling folder
 *     resources - full directory path to resources (ie. images, video, etc.)
 */
module.exports = {
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
     */
    respond: function(req, res) {
        fs = require("fs");
        url = require("url");
        reqpath = url.parse(req.url).pathname;
        //strip out the query to search path/file
        //First, check if it is a valid resource file, and return it from the resources directory
        try {
            if (!resource(reqpath, req, res) && !response(reqpath, req, res)) {
                require(path.join(responsesdefault, "404"))(req, res);
            }
        } catch (err) {
            console.warn("Caught error responding to request: " + err.stack);
            require(path.join(responsesdefault, "500"))(req, res);
        }
        return module.exports;
    }
};
