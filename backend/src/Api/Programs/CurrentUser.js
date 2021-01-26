const HttpServeProgram = require("../../HttpServe/HttpServeProgram")
const DB = require("../../Utils/DatabaseConnection");


class CurrentUser extends HttpServeProgram {


    handleRequest(req, res, data) {
        res.setHeader("Content-Type", "application/json");

    }
}

module.exports = CurrentUser;