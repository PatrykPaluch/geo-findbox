const HttpServeProgram = require("../../HttpServe/HttpServeProgram")

class Login extends HttpServeProgram {

    handleRequest(req, res, data) {
        res.setHeader("Content-Type", "application/json");

    }
}

module.exports = Login;