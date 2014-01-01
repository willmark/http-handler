http-handler
============

> Stability - 2 Unstable

Synchronize two files based on hash values

## API

````
//install
npm install http-handler

//usage
handler = require('http-handler')([{
    responses: <directory path to response handlers>,
    resources: <directory path to resources (ex. images, videos, static html)>
}]);

handler.respond(req, res);
````
