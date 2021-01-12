const http = require("http")
const HttpServeProgram = require("./HttpServeProgram");

/**
 * Parsing request body to JSon if possible.
 * Parsed body can override 'body' variable of {@link http.IncomingMessage} if {@link #replaceOriginalBody} is true
 * or can create new 'bodyJson' in {@link http.IncomingMessage} if {@link #replaceOriginalBody} is false.
 *
 * If parsing to JSon is not possible (eg. body is not JSon format) then do nothing if
 * {@link #emptyJSonObjectWhenCantParse} is false or creating empty JS {@link Object} if
 * {@link #emptyJSonObjectWhenCantParse} is true.
 *
 * @see #replaceOriginalBody
 * @see #emptyJSonObjectWhenCantParse
 */
class BodyToJson extends HttpServeProgram {

    /**
     * @type {boolean}
     * if true then override original request body
     * if false then creating new variable 'bodyJson' in request
     * @see BodyToJson
     */
    #replaceOriginalBody;

    /**
     * @type {boolean}
     * Determinate action when parsing to JSon is not possible (eg. body is not in JSon format).
     *
     * if true then creating empty JS {@link Object} (to variable determinate by {@link #replaceOriginalBody}
     * if false then do nothing
     * @see BodyToJson
     */
    #emptyJSonObjectWhenCantParse

    /**
     * @type {boolean}
     * Determinate action header "content-type" is not "application/json"
     *
     * if true then creating empty JS {@link Object} (to variable determinate by {@link #replaceOriginalBody}
     * if false then do nothing
     * @see BodyToJson
     */
    #emptyJSonObjectWhenNotApplicationJSon


    /**
     *
     * @param {boolean} replaceOriginalBody - true to replace original body with JSon;
     *                                        false to create new variable for JSon
     *
     * @param {boolean} emptyJSonObjectWhenCantParse - true to create empty Object when parsing is not possible;
     *                                                 false to do nothing when parsing is not possible
     *
     * @param {boolean} emptyJSonObjectWhenNotApplicationJSon - true to create empty Object when header "content-type"
     *                                                          is not "application/json"
     *                                                          false to do nothing otherwise
     *
     * @see #replaceOriginalBody
     * @see #emptyJSonObjectWhenCantParse
     * @see #emptyJSonObjectWhenNotApplicationJSon
     */
    constructor(replaceOriginalBody = true,
                emptyJSonObjectWhenCantParse = true,
                emptyJSonObjectWhenNotApplicationJSon = false)
    {
        super();
        this.#replaceOriginalBody = replaceOriginalBody;
        this.#emptyJSonObjectWhenCantParse = emptyJSonObjectWhenCantParse;
        this.#emptyJSonObjectWhenNotApplicationJSon = emptyJSonObjectWhenNotApplicationJSon;
    }

    handleRequest(req, res, data) {
        /**@type {String} */
        let contentType = req.headers["content-type"];

        let newBody;
        if(contentType.toLowerCase() === "application/json") {
            newBody = this.processApplicationJSon(req, res, data);
        }
        else {
            if(this.#emptyJSonObjectWhenNotApplicationJSon)
                newBody = {};
            else
                newBody = null;
        }
        if(newBody !== null) {
            if (this.#replaceOriginalBody)
                req.body = newBody;
            else
                Object.defineProperty(req, "bodyJson", {
                    value: newBody,
                    writable: true
                });
        }
    }

    /**
     * @param {HttpServeIncomingMessage} req - http request
     * @param {module:http.ServerResponse} res - http response
     * @param {HttpServeData} data - processed data from other HttpServePrograms
     * @see HttpServeData
     */
    processApplicationJSon(req, res, data){
        let body = req.body;
        try {
            return JSON.parse(body);
        } catch (e) {
            if (this.#emptyJSonObjectWhenCantParse) {
               return {}
            }
            return null;
        }
    }

}

module.exports = BodyToJson;