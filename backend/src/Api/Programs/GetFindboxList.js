const Logger = require("../../Utils/Logger").mainLogger;
const HttpServeProgram = require("../../HttpServe/HttpServeProgram");
const DB = require("../../Utils/DatabaseConnection");
const sessionController = require("../SessionController").sessionController;

class GetFindboxList extends HttpServeProgram {

    static TAG = "API-GetFindboxList";

    handleRequest(req, res, data) {
        res.setHeader("Content-Type", "application/json");
        let session = sessionController.startSession(req, res);

        if (!processLoggedCheck(res, session))
            return;

        let userId = req.body['user_id'];
        let offset = req.body['offset'] || 0;
        let limit = req.body['limit'] || 20;

        if (userId === undefined || userId < 0) {
            sendErrors(res, ["Brak id usera"]);
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
                    
                  WHERE F.author = $1
                  LIMIT $2 OFFSET $3`,
            [userId, limit, offset],
            (err, queryRes) => {
            if(err){
                Logger.logE(GetFindboxList.TAG, err);
                processInternalError(res);
                return;
            }
            let outputData = [];
            for(let i = 0 ; i < queryRes.rowCount ; i++){
                let row = queryRes.rows[i];
                outputData.push({
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

            responseEnd(res, 200, {
                findboxList: outputData
            })
        });

    }
}

module.exports = GetFindboxList;