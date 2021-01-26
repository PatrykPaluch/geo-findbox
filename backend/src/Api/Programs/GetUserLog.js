const Logger = require("../../Utils/Logger").mainLogger;
const HttpServeProgram = require("../../HttpServe/HttpServeProgram");
const sessionController = require("../SessionController").sessionController;
const DB = require("../../Utils/DatabaseConnection");

class GetUserLog extends HttpServeProgram {

    static TAG = "API-GetUserLog";

    handleRequest(req, res, data) {
        res.setHeader("Content-Type", "application/json");
        let session = sessionController.startSession(req, res);

        if (!processLoggedCheck(res, session))
            return;

        let findboxId = req.body['findbox_id'];
        let userId = req.body['user_id'];
        let offset = req.body['offset'] || 0;
        let limit = req.body['limit'] || 20;

        if (!checkId(findboxId) && !checkId(userId)) {
            sendErrors(res, ["Brak id findboxa lub id usera"]);
            return;
        }

        let queryParameters = [limit, offset];

        let where = " WHERE "
        if(findboxId !== undefined) {
            where += " L.findbox_id = $3 "
            queryParameters.push(findboxId);
        }


        if(userId !== undefined) {
            queryParameters.push(userId);
            if(findboxId !== undefined)
                where += "AND L.user_id = $4 "
            else
                where += "L.user_id = $3"

        }


        DB.query(`SELECT L.userlog_id as "userlog_id",
                         L.findbox_id as "userlog_findbox_id",
                         L.user_id as "userlog_user_id",
                         L.comment as "userlog_comment",
                         L.found as "userlog_found",
                         L.create_time as "userlog_create_time",
                         F.name as "findbox_name",
                         F.author as "findbox_author",
                         F.create_time as "findbox_create_time",
                         F.geo_location as "findbox_geo_location",
                         LEFT(F.description, 50) as "findbox_description",
                         F.findbox_id as "findbox_id",
                         FU.nick as "findbox_author_nick",
                         U.user_id as "user_id",
                         U.nick as "user_nick" 
               FROM "UserLog" L 
                    INNER JOIN "User" U on L.user_id = U.user_id
                    INNER JOIN "Findbox" F on L.findbox_id = F.findbox_id
                    INNER JOIN "User" FU on F.author = FU.user_id`
                + where
                  +`LIMIT $1 OFFSET $2`,
            queryParameters,
            (err, queryRes) => {
                if(err){
                    Logger.logE(GetUserLog.TAG, err);
                    processInternalError(res);
                    return;
                }
                let outputResult = []
                for(let i = 0; i < queryRes.rowCount ; i++){
                    let row = queryRes.rows[i];
                    outputResult.push({
                        userlog_id: row['userlog_id'],
                        findbox: {
                            findbox_id: row['findbox_id'],
                            name:  "findbox_name",
                            author: {
                                user_id: row["findbox_author"],
                                nick: row["findbox_author_nick"]
                            },
                            create_time: row["findbox_create_time"],
                            geo_location: row["findbox_geo_location"],
                            description: row["findbox_description"],
                        },
                        user: {
                            user_id: row['user_id'],
                            nick: row['user_nick']
                        },
                        comment: row['userlog_comment'],
                        found: row['userlog_found'],
                        create_time: row['userlog_create_time'],
                    });
                }

                responseEnd(res, 200, {
                    "findbox_id": findboxId,
                    "userLogList": outputResult
                });

            });
    }
}

module.exports = GetUserLog;