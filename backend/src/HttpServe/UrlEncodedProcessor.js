const Logger = require("../Utils/Logger").mainLogger;

const http = require("http")
const HttpServeProgram = require("./HttpServeProgram");

/**
 * Parses request URL parameters to array
 */
class UrlEncodedProcessor extends HttpServeProgram {

    constructor() {
        super();
    }

    handleRequest(req, res, data) {
        let url = req.url;

        let startDataIndex;
        if ((startDataIndex = url.indexOf('?')) < 0)
            return;

        let urlPart = url.substr(0, startDataIndex);
        let dataPart = url.substr(startDataIndex+1);

        req.url = urlPart;

        let pairs = dataPart.split('&');

        Logger.logT("UrlEncodedProcessor", `${startDataIndex}, "${dataPart}": ${pairs}`)

        for (let i = 0; i < pairs; i++) {
            let keyValue = this.split(pairs[i], '=');
            req.urlencoded[keyValue[0]] = keyValue[1];
        }
    }
    /**
     *
     * @param {String} str
     * @param {String} char
     * @return {String[]|null}
     */
    split(str, char){
        let indOf = str.indexOf(char);
        if(indOf <= 0)
            return null;

        return [str.substring(0, indOf), str.substr(indOf+1)];
    }

}

module.exports = UrlEncodedProcessor;