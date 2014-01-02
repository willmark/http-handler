path = require("path");

modulepfx = path.dirname(module.filename) + path.sep;

responsesdefault = modulepfx + "responses";

resourcesdefault = modulepfx + "resources";

responses = responsesdefault;

resources = resourcesdefault;

/**
 * Join resources root folder to requested sub-directory
 * id - sub-folder path
 * req - http request http.IncomingMessage
 * res - http response http.ServerResponse
 */
resource = function(id, req, res) {
    try {
        //first, give parent module a chance to handle the resource
        return require(path.join(resources, id))(req, res);
    } catch (err) {
        //failed module load with config repository, try within this module directory
        //default behavior is to read the resources file and pipe to response stream
        console.log('no resource in owner module, try default: ' + err);
        handler = require(resourcesdefault);
        console.log('handler fun ' + Object.keys(handler));
        return handler.load(resources, req, res);
        //return require(resourcesdefault)(resources, req, res);
        //return require(path.join(resourcesdefault, id))(req, res);
    }
};

/**
 * Join responses root folder to requested sub-directory
 * id - sub-folder path
 * req - http request http.IncomingMessage
 * res - http response http.ServerResponse
 */
response = function(id, req, res) {
    try {
        return require(path.join(responses, id))(req, res);
    } catch (err) {
        //failed module load with config repository, try within this module directory
        return require(responsesdefault + path.sep + id)(req, res);
    }
};

/**
 * Exports the respond function to handling http responses
 * config - configuration options
 *     responses - full directory path to responses handling folder
 *     resources - full directory path to resources (ie. images, video, etc.)
 */
module.exports = {
    init: function(config) {
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
        file = path.join(resources, reqpath);
        //index.js is reserved to handlers, give a 404
        if (path.basename(file).match(/index.js/)) {
            console.log("Tried handling " + reqpath + " as a file (index.js reserved for module loading.  Responding with 404.");
            response("404", req, res);
            return;
        }
                //allow only the index.js handler for the file dir location handle the request 
                try {
                    resource(reqpath, req, res);
                } catch (err) {
 console.error('caught the resource read err: ' + err);
                        //non-file requests are handled by respective index.js in the requested path
                        try {
                            response(reqpath, req, res);
                        } catch (err) {
                            //path to 500 handler
                            console.error("Caught Unknown Error: " + err);
                            response("500", req, res);
                        }
                }
        return module.exports;
    }
};
