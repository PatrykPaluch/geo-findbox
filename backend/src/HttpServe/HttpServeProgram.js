/**
 * Interface for handling requests from HttpServe application
 */
class HttpServeProgram {

    /**
     * Handles request from HttpServe application. If request is fully handled (response should be send to client)
     * then use <b><code>data.done = true</code></b>.
     *
     * By setting <b><code>data.done</code></b>. to <b><code>true</code></b>. HttpServe application will <b>not</b>
     * send this request to next HttpServeProgram.
     *
     * @param {HttpServeIncomingMessage} req - http request
     * @param {module:http.ServerResponse} res - http response
     * @param {HttpServeData} data - processed data from other HttpServePrograms
     * @see HttpServeData
     */
    handleRequest(req, res, data){
    }
}

module.exports = HttpServeProgram