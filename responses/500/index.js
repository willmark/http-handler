/**
 * Default 500 handler
 */
module.exports = function (req, res) {
    res.writeHead(500, {
        "Content-Type": "text/plain"
    });
    res.write(req.url + " unknown error");
    res.end();
};
