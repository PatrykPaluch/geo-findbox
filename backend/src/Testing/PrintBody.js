const HttpServeProgram = require("../HttpServe/HttpServeProgram");

class PrintBody extends HttpServeProgram {

    #id;
    constructor(id) {
        super();
        this.#id = id;
    }

    handleRequest(req, res, data) {
        let type = typeof req.body;
        console.log(`[PrintBody-${this.#id}] Body Type: '${type}'`);
        console.log(req.body);
    }
}

module.exports = PrintBody;