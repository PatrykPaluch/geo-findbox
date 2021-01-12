const HttpServeProgram = require("./HttpServeProgram")
const fs = require("fs");
const Path = require("path");

const config = require("./HttpServeConfiguration")
const Mime = require("../MimeTypes/Mime");

function addSlashToEnd(str){
    if(!str.endsWith("/"))
        return  str + "/";
    return str;
}

class FileRouter extends HttpServeProgram {

    /** @type {string} */
    _reqPath;
    /** @type {string} */
    _filePath;

    /**
     * @param {string} reqPath - URL path from request eg. "/forum/"
     * @param {string} filePath - path to file on server in public_html eg. "/pages/forum"
     */
    constructor(reqPath, filePath) {
        super();
        if(!reqPath || !filePath)
            throw new Error("reqPath or filePath is undefined");

        reqPath = addSlashToEnd(reqPath);
        filePath = addSlashToEnd(filePath);

        this._reqPath = reqPath;
        this._filePath = filePath;
    }

    handleRequest(req, res, data) {
        console.log(`    Router "${this._reqPath}" > "${this._filePath}"`);

        if(req.method === "GET"){
            console.log(`      GET`);

            if(req.url && req.url.startsWith(this._reqPath)){
                let lastPartOfUrl = req.url.substring(this._reqPath.length);
                let localURL = Path.join(this._filePath, lastPartOfUrl);
                let lastSlash = localURL.lastIndexOf("/");

                // append "/index.html" to folder path
                if(lastSlash > -1){
                    let lastDot = localURL.lastIndexOf(".");
                    if(lastDot < lastSlash){
                        localURL = Path.join(localURL, "/index.html");
                    }
                }

                console.log(`      "${req.url}" > "${localURL}"`);

                this.processPage(localURL, req, res, data);

                data.done = true;
            }
        }
    }

    /**
     * @param {string} path
     * @param {module:http.IncomingMessage} req - http request
     * @param {module:http.ServerResponse} res - http response
     * @param {HttpServeData} data - processed data from other HttpServePrograms
     */
    processPage(path, req, res, data){
        let filePath = Path.join(config.configuration.mainPath, path);

        console.log("      filePath", filePath, "|", "req url", req.url);

        fs.access(filePath, fs.constants.R_OK, (err)=>{
            if(err){
                res.writeHead(404, {"Content-Type":"text/plain"});
                res.end("Not Found");
                return;
            }

            // find mime-type for response (HTTP header Content-Type)
            let type = Path.extname(filePath).substring(1);
            let mime = Mime.getMime(type);

            res.writeHead(200, {
                'Content-Type': (mime ? mime : "text/plain")
            });

            fs.createReadStream(filePath).pipe(res);
        });
    }

}

module.exports = FileRouter