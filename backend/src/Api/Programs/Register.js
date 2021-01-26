const HttpServeProgram = require("../../HttpServe/HttpServeProgram")
const DB = require("../../Utils/DatabaseConnection");
const sessionController = require("../SessionController").sessionController;

class Register extends HttpServeProgram {

    handleRequest(req, res, data) {
        sessionController.startSession(req, res);
        res.setHeader("Content-Type", "application/json");

        let userNick = req.body['nick'];
        let password = req.body['password'];
        let passwordRepeat = req.body['password-repeat'];
        let email = req.body['email'];
        let license = req.body['license-accept'];

        let errorMessages = [];
        if (!userNick)
            errorMessages.push("Brak nicku");
        if (!password || !passwordRepeat)
            errorMessages.push("Brak hasła");
        else if (password.length < 8)
            errorMessages.push("Za słabe hasło");
        if (password !== passwordRepeat)
            errorMessages.push("Powtórzone hasło nie jest takie samo");
        if (!email)
            errorMessages.push("Brak email");
        if (!license)
            errorMessages.push("Licencja nie zaakceptowana");


        if (errorMessages.length !== 0) {
            res.writeHead(400);
            res.write(JSON.stringify({
                error: "Form data error",
                formErrors: errorMessages
            }));
            res.end();
        }
        else {
            res.writeHead(200);
            res.write(JSON.stringify({
                info: "User was created",
            }));
            res.end();
        }

    }

}

module.exports = Register;