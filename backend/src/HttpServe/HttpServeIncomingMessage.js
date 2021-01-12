const http = require("http")

class HttpServeIncomingMessage extends http.IncomingMessage{
    /** @type {String|Object|any} */
    body;

}