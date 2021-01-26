const Logger = require("../../Utils/Logger").mainLogger;
const HttpServeProgram = require("../../HttpServe/HttpServeProgram");
const DB = require("../../Utils/DatabaseConnection");
const sessionController = require("../SessionController").sessionController;

class Login extends HttpServeProgram {

    static TAG = "API-Login";

    handleRequest(req, res, data) {
        res.setHeader("Content-Type", "application/json");
        let userNick = req.body['nick'];
        let passwordStr = req.body['password'];

        let passwordHash = hashPassword(passwordStr, userNick);

        DB.query(`SELECT * FROM "User" WHERE nick = $1 AND password = $2`,
            [userNick, passwordHash],
            (err, queryRes)=>{
            if(err){
                Logger.logW(Login.TAG, "insert user error: " + err);
                processInternalError(res);
                return;
            }
            if(queryRes.rowCount > 0){
                let session = sessionController.startSession(req, res);
                let userId = queryRes.rows[0].user_id;
                session.setData(SESSION_KEY_LOGGED, true);
                session.setData(SESSION_KEY_USER_ID, userId);

                responseEnd(res, 200, {info: "success"});
                return;
            }
            responseEnd(res, 400, {error:"Zły login lub hasło"});
        });

    }
}

module.exports = Login;