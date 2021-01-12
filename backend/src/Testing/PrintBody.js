const Logger = require("../Utils/Logger").mainLogger;
const HttpServeProgram = require("../HttpServe/HttpServeProgram");

class PrintBody extends HttpServeProgram {

    #id;
    constructor(id) {
        super();
        this.#id = id;
    }

    handleRequest(req, res, data) {
        let tag = `PrintBody-${this.#id}`;
        Logger.logT(tag, "Start");

        let urlEncodedKeys = Object.keys(req.urlencoded)
        Logger.logT(tag, `  urlencoded - ${urlEncodedKeys.length} keys:`);
        for(let i = 0 ; i < urlEncodedKeys ; i++){
            Logger.logT(tag, `     ${urlEncodedKeys[i]} = ${req.urlencoded[urlEncodedKeys[i]]}`)
        }
        let type = typeof req.body;
        Logger.logT(tag, `  body type: ${type}`)
        Logger.logT(tag, req.body);
        Logger.logT(tag, "End");
    }
}

module.exports = PrintBody;