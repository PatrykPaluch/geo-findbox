const Logger = require("../../Utils/Logger").mainLogger;
const HttpServeProgram = require("../../HttpServe/HttpServeProgram");
const DB = require("../../Utils/DatabaseConnection");
const sessionController = require("../SessionController").sessionController;


class LogFind extends HttpServeProgram {

    static TAG = "API-LogFind";

    handleRequest(req, res, data) {
        res.setHeader("Content-Type", "application/json");

        let session = sessionController.startSession(req, res);

        if(!processLoggedCheck(res, session))
            return;

        let findboxId = req.body['findbox_id'];
        let found = req.body['found'];
        let comment = (req.body['comment'] || '').trim();

        let errorMessages = []
        if(findboxId === undefined || findboxId < 0)
            errorMessages.push("Brak id findbox");
        if(!comment)
            errorMessages.push("Brak komentarza");

        let userId = session.getData(SESSION_KEY_USER_ID);

        if(sendErrors(res, errorMessages))
            return;

        Logger.logT(LogFind.TAG, "Sending request to DB");
        DB.query(`INSERT INTO "UserLog" (user_id, findbox_id, found, comment, create_time) 
                  VALUES ($1, $2, $3::bool, $4, Now())`,
            [userId, findboxId, found, comment ],
            (err, queryRes)=>{
            if(err){
                processInternalError(res);
                return;
            }
            Logger.logT(LogFind.TAG, "Created new LogFind");
            responseEnd(res, 200, {
               info: "Log created"
            });
        });

    }
}

module.exports = LogFind;