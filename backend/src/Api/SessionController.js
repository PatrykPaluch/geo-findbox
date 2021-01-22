const crypto = require("crypto")

class SessionController {

    /** @type {Map<string, SessionEntry>} */
    #sessionMap;

    #maxSessionLifetime

    constructor(maxSessionLifetime) {
        this.#sessionMap = new Map();
        this.#maxSessionLifetime = maxSessionLifetime;
    }


    createSession(){

    }


    clearOldSessions(){
        for(let sessionKV of this.#sessionMap){
            if(sessionKV[])
        }
    }

    _updateEntryID(oldID, newID){

    }

}


class SessionEntry {

    /** @type {SessionController} */
    #sessionController
    /** @type {string} */
    #ID;
    /** @type {Map<string, any>} */
    #data;
    /** @type {number} */
    #initializeTime;
    /** @type {number} */
    #refreshTime;

    constructor(controller) {
        if(typeof controller !== "object" || controller.constructor.name !== SessionController.name)
            throw TypeError("Invalid argument controller");

        this.#sessionController = controller;
        this.#ID = crypto.randomUUID();
        this.#data = new Map();
        this.#initializeTime = Date.now();
        this.#refreshTime = this.#initializeTime;
    }

    get parentSessionController(){
        return this.#sessionController;
    }

    get ID(){
        return this.#ID;
    }

    get initializeTime(){
        return this.#initializeTime;
    }

    get refreshTime(){
        return this.#refreshTime;
    }

    refreshSession(){
        this.#refreshTime = Date.now();
    }

    /**
     * Generates new ID for session
     * @return {string} new ID
     */
    regenerateID(){
        let newID = crypto.randomUUID();
        this.#sessionController._updateEntryID(this.#ID, newID);
        this.#ID = newID;
        return this.#ID;
    }

    /**
     *
     * @param key {string}
     * @return {*}
     */
    getData(key){
        return this.#data.get(key);
    }

    /**
     *
     * @param key {string}
     * @param data {*}
     */
    setData(key, data){
        this.#data.set(key, data);
    }

    /**
     *
     * @param key {string}
     */
    deleteData(key){
        this.#data.delete(key);
    }

    clearData(){
        this.#data.clear();
    }

    /**
     * @return {IterableIterator<string>}
     */
    dataKeys(){
        return this.#data.keys();
    }



}