const Logger = require("../../Utils/Logger").mainLogger;
const HttpServeProgram = require("../../HttpServe/HttpServeProgram");
const sessionController = require("../SessionController").sessionController;
const DB = require("../../Utils/DatabaseConnection");

class GetFindbox extends HttpServeProgram {

    static TAG = "API-GetFindbox";

    handleRequest(req, res, data) {
        res.setHeader("Content-Type", "application/json");
        let session = sessionController.startSession(req, res);

        if (!processLoggedCheck(res, session))
            return;

        let findboxId = req.body['findbox_id'];

        if (!checkId(findboxId)) {
            sendErrors(res, ["Brak id findboxa"]);
            return;
        }

        DB.query(`SELECT F.findbox_id as "findbox_id",
                         F.author as "findbox_autor_id",
                         F.name as "findbox_name", 
                         F.description as "findbox_description",
                         F.create_time as "findbox_create_time",
                         F.geo_location as "findbox_geo_location",
                         U.user_id as "user_id",
                         U.nick as "user_nick",
                         (SELECT COUNT(*) FROM "UserLog" L WHERE F.findbox_id = L.findbox_id) as "log_count"
               FROM "Findbox" F 
                    INNER JOIN "User" U on F.author = U.user_id
                    INNER JOIN "UserLog" L on F.findbox_id = L.findbox_id
                  WHERE F.findbox_id = $1
                  LIMIT 1`,
            [findboxId],
            (err, queryRes) => {
                if(err){
                    Logger.logE(GetFindbox.TAG, err);
                    processInternalError(res);
                    return;
                }

                if(queryRes.rowCount > 0){
                    let row = queryRes.rows[0];
                    responseEnd(res, 200, {
                        findbox_id: row['findbox_id'],
                        author: {
                            user_id: row['user_id'],
                            nick: row['user_nick']
                        },
                        name: row['findbox_name'],
                        description: row['findbox_description'],
                        create_time: row['findbox_create_time'],
                        geo_location: row['findbox_geo_location'],
                        log_count: row['log_count'],
                    });
                }


            });

    }
}

module.exports = GetFindbox;