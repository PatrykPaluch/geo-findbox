const HttpServeProgram = require("../../HttpServe/HttpServeProgram")

class Poke extends HttpServeProgram {


    handleRequest(req, res, data) {
        res.setHeader("Content-Type", "application/json");

        res.write(JSON.stringify({message: "pong"}));
    }
}

module.exports = Poke;