const Logger = require("../../Utils/Logger").mainLogger;
const HttpServeProgram = require("../../HttpServe/HttpServeProgram");
const sessionController = require("../SessionController").sessionController;

class Logout extends HttpServeProgram {

    static TAG = "API-Logout";

    handleRequest(req, res, data) {
        res.setHeader("Content-Type", "application/json");
        let session = sessionController.startSession(req, res);
        session.clearData();
        session.destroy();
        Logger.logT(Logout.TAG,"Session destroyed");
        responseEnd(res, 200, {
            "info": "Wylogowano"
        });
    }
}

module.exports = Logout;