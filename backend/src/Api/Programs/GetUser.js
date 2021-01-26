const Logger = require("../../Utils/Logger").mainLogger;
const HttpServeProgram = require("../../HttpServe/HttpServeProgram");
const sessionController = require("../SessionController").sessionController;
const DB = require("../../Utils/DatabaseConnection");

class GetUser extends HttpServeProgram {

    static TAG = "API-GetUser";

    handleRequest(req, res, data) {
        res.setHeader("Content-Type", "application/json");
        let session = sessionController.startSession(req, res);

        if(!processLoggedCheck(res, session))
            return;

        let userId = req.body['user_id'];

        if (!checkId(userId)) {
            sendErrors(res, ["Brak id usera"]);
            return;
        }

        DB.query(`SELECT * FROM "User" WHERE user_id = $1`,
            [userId], (err, queryRes)=>{
                if(err){
                    processInternalError(res);
                    return;
                }
                if(queryRes.rowCount > 0){
                    let row = queryRes.rows[0];
                    responseEnd(res, 200, {
                        "user_id": row['user_id'],
                        "nick": row['nick'],
                        "registration_date": row['registration_date']
                    });
                }
                else {
                    responseEnd(res, 404, {
                        "error": "Nie znaleziono usera"
                    });
                }

            });
    }
}

module.exports = GetUser;