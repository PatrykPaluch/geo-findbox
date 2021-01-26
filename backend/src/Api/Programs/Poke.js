const HttpServeProgram = require("../../HttpServe/HttpServeProgram")

class Poke extends HttpServeProgram {


    handleRequest(req, res, data) {
        res.setHeader("Content-Type", "application/json");

        responseEnd(res, 200, {message: "pong"});
    }
}

module.exports = Poke;