/**
 * Default 404 handler
 */
module.exports = function (req, res) {
    res.writeHead(404, {
        "Content-Type": "text/plain"
    });
    res.write(req.url + " not found");
    res.end();
};
