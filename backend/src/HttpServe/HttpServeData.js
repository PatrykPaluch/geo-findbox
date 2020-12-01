class HttpServeData {
    /**
     * When set to true then HttpServe program will send response without passing request to next HttpServeProgram
     * @type {boolean}
     */
    done;

    constructor() {

        this.done = false;
    }
}

module.exports = HttpServeData;