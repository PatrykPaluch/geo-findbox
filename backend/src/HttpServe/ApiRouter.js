const Logger = require("../Utils/Logger").mainLogger;

const HttpServeProgram = require("./HttpServeProgram")

const config = require("./HttpServeConfiguration")
/**
 * Each request on to this Api will always send response.
 * Request path to Api is determined by #reqPath.
 * Each program in this Api should end response stream on its own
 */
class ApiRouter extends HttpServeProgram {
    static TAG = "ApiRouter";

    /** @type {Map<string, HttpServeProgram>} */
    #map;
    /** @type {string} */
    #reqPath


    constructor(reqPath) {
        super();
        this.#map = new Map();
        this.#reqPath = reqPath;
    }


    /**
     * Adds 'program' to Api. Program will be executed when request to Api has POST data with `service` variable set to
     * path to 'apiPath'
     * @param apiPath - "Path to program" - value of POST 'service' variable
     * @param program - program to execute
     * @see #removeRoute
     */
    addRoute(apiPath, program){
        this.#map.set(apiPath, program);
    }

    /**
     * Removes program from Api
     * @param requestPath - "Path to program" (passed in {@link #addRoute})
     * @see #addRoute
     */
    removeRoute(requestPath){
        this.#map.delete(requestPath);
    }

    handleRequest(req, res, data) {


        let requestPath = req.url;
        if(requestPath.startsWith(this.#reqPath)) { // handle request only for this
            if(req.method.toLowerCase() !== "post") { // handle request only for POST method
                data.done = true;
                res.setHeader("Content-Type", "application/json");
                res.writeHead(400);
                res.write(JSON.stringify({error:"Api accepts only POST requests"}));
                res.end();
                return;
            }

            let body = req.body;
            if(body.hasOwnProperty("service")) { // "service" - Api program path
                let service = body.service;
                Object.defineProperty(data, "apiService", {
                    value: service,
                    writable: true,
                    enumerable: true
                });

                Logger.logT(ApiRouter.TAG, `    API "${this.#reqPath}" # "${service}"`);
                let program = this.#map.get(service);

                if(program === undefined) { // program not found
                    Logger.logT(ApiRouter.TAG, `      Program missing (404)`);
                    res.writeHead(404);
                    res.end();
                    data.done = true;
                    return;
                }
                program.handleRequest(req, res, data);
                data.done = true;
            }
            else {
                data.done = true;
                res.setHeader("Content-Type", "application/json");
                res.writeHead(400);
                res.write(JSON.stringify({error:"Missing 'service' variable"}));
                res.end();
                return;
            }
        }

    }

}

module.exports = ApiRouter;