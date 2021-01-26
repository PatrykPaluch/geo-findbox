require("../../Utils/Const");

const Logger = require("../../Utils/Logger").mainLogger;
const HttpServeProgram = require("../../HttpServe/HttpServeProgram")
const DB = require("../../Utils/DatabaseConnection");
const sessionController = require("../SessionController").sessionController;
const crypto = require("crypto");

class Register extends HttpServeProgram {

    static TAG = "API-Register";

    handleRequest(req, res, data) {
        sessionController.startSession(req, res);
        res.setHeader("Content-Type", "application/json");

        let userNick = req.body['nick']
        let passwordStr = req.body['password'];
        let passwordRepeat = req.body['password_repeat'];
        let email = req.body['email']
        let license = req.body['license_accept'];

        userNick = (userNick || "").trim();
        email = (email || "").trim();

        let errorMessages = [];
        if (!userNick)
            errorMessages.push("Brak nicku");
        if (!passwordStr || !passwordRepeat)
            errorMessages.push("Brak hasła");
        else if (passwordStr.length < 8)
            errorMessages.push("Za słabe hasło");
        if (passwordStr !== passwordRepeat)
            errorMessages.push("Powtórzone hasło nie jest takie samo");
        if (!email)
            errorMessages.push("Brak email");
        if(!validateEmail(email))
            errorMessages.push("Email jest niepoprawny");
        if (!license)
            errorMessages.push("Licencja nie zaakceptowana");

        if(sendErrors(res, errorMessages))
            return;

        DB.query(`SELECT user_id, nick, email FROM "User" WHERE nick = $1 OR email = $2`,
            [userNick, email], (err, queryRes)=> {
            if(err){
                Logger.logW(Register.TAG, "select nick/email error: " + err);
                processInternalError(res);
                return;
            }

            if(queryRes.rowCount > 0){
                let row = queryRes.rows[0];
                console.log(row, row.nick, row.email, userNick, email, row.nick === userNick, row.email === email);
                errorMessages = [];
                if(row.nick === userNick)
                    errorMessages.push("Nick jest juz zajety");
                if(row.email === email)
                    errorMessages.push("Email jest jus zajety");

                if(sendErrors(res, errorMessages))
                    return;
            }


            let passwordHash = hashPassword(passwordStr, userNick)

            DB.query(
                `INSERT INTO "User" (nick, email, password, registration_date) VALUES ($1, $2, $3, NOW())`,
                [userNick, email, passwordHash], (err, queryRes)=> {
                if(err){
                    Logger.logW(Register.TAG, "insert user error: " + err);
                    processInternalError(res);
                    return;
                }

                Logger.logT(Register.TAG, "New user inserted to database");
                responseEnd(res, 200, {
                    info: "User was created",
                });
            }
        );

        });

    }
}

module.exports = Register;