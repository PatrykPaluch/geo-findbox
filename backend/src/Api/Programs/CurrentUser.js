const HttpServeProgram = require("../../HttpServe/HttpServeProgram")
const DB = require("../../Utils/DatabaseConnection");
const sessionController = require("../SessionController").sessionController;

class CurrentUser extends HttpServeProgram {


    handleRequest(req, res, data) {
        res.setHeader("Content-Type", "application/json");
        let session = sessionController.startSession(req, res);
        if(!processLoggedCheck(res, session))
            return;

        let userID = session.getData(SESSION_KEY_USER_ID);
        DB.query(`SELECT * FROM "User" WHERE user_id = $1`,
            [userID], (err, queryRes)=>{
           if(err){
               processInternalError(res);
               return;
           }
           if(queryRes.rowCount > 0){
               let row = queryRes.rows[0];
               responseEnd(res, 200, {
                  "user_id": row['user_id'],
                  "nick": row['nick'],
                  "email": row['email'],
                  "registration_date": row['registration_date']
               });
           }
           else {
               responseEnd(res, 404, {
                  "error": "Brak danych dla zalogowanego uzytkownika"
               });
           }

        });
    }
}

module.exports = CurrentUser;