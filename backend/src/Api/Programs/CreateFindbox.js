const Logger = require("../../Utils/Logger").mainLogger;
const HttpServeProgram = require("../../HttpServe/HttpServeProgram");
const sessionController = require("../SessionController").sessionController;
const DB = require("../../Utils/DatabaseConnection");

class CreateFindbox extends HttpServeProgram {

    static TAG = "API-CreateFindbox";

    handleRequest(req, res, data) {
        res.setHeader("Content-Type", "application/json");
        let session = sessionController.startSession(req, res);

        if(!processLoggedCheck(res, session))
            return;


        let name = (req.body['name'] || '').trim();
        let description = (req.body['description'] || '').trim();
        let geo_location = (req.body['geo_location'] || '').trim();

        let errorMessages = []
        if(!name)
            errorMessages.push("Brak nazwy");
        if(!description)
            errorMessages.push("Brak opisu");
        if(!geo_location)
            errorMessages.push("Brak lokalizacji");

        let userId = session.getData(SESSION_KEY_USER_ID);

        if(sendErrors(res, errorMessages))
            return;

        DB.query(`INSERT INTO "Findbox" (author, name, description, create_time, geo_location)
VALUES ($1, $2, $3, Now(), $4)`,
            [userId, name, description, geo_location],
            (err, queryRes)=>{
            if(err){
                processInternalError(res);
                return;
            }
            Logger.logT(CreateFindbox.TAG, "Created new Findbox");
            responseEnd(res, 200, {
                info: "Findbox created"
            });
        });
    }
}

module.exports = CreateFindbox;