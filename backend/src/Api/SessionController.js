const crypto = require("crypto")
const http = require("http");
const Logger = require("../Utils/Logger").mainLogger;

const COOKIES_SESSION_KEY = "sessionidkey";

class SessionController {

    static TAG = "SessionController";

    /** @type {Map<string, SessionEntry>} */
    #sessionMap;

    #maxSessionLifetime

    constructor(maxSessionLifetime) {
        this.#sessionMap = new Map();
        this.#maxSessionLifetime = maxSessionLifetime;
    }


    /**
     * Gets session from session data base or creates new
     * @param {HttpServeIncomingMessage} req
     * @param {module:http.ServerResponse} res
     * @returns {SessionEntry} session for request
     */
    startSession(req, res){
        let sessionID = SessionController.#getSessionIdFromRequest(req);
        if(sessionID){
           let sessionEntry = this.#sessionMap.get(sessionID);
           if(sessionEntry){
               if(!this.#checkSessionLife(sessionEntry)){
                   sessionEntry.refreshSession();
                   Logger.logT(SessionController.TAG, "Using existing session");

                   res.setHeader("Set-Cookie", `${COOKIES_SESSION_KEY}=${sessionEntry.ID}`);
                   return sessionEntry;
               }
               Logger.logI(SessionController.TAG, "Session too old. Removing");
               this._removeSession(sessionEntry.ID);
           }
        }
        let newSessionEntry = new SessionEntry(this);
        let newSessionKey = newSessionEntry.ID;
        this.#sessionMap.set(newSessionKey, newSessionEntry);
        res.setHeader("Set-Cookie", `${COOKIES_SESSION_KEY}=${newSessionKey}`);
        Logger.logT(SessionController.TAG, "Created new session");

        return newSessionEntry;
    }

    /**
     * @param {SessionEntry} sessionEntry
     */
    #checkSessionLife(sessionEntry){
        return sessionEntry.refreshTime + this.#maxSessionLifetime > Date.now();
    }

    static #getSessionIdFromRequest(req){
        let cookiesStr = req.headers.cookie || "";
        let cookies = cookiesStr.split(";");
        for(let cookieKVStr of cookies){
            let cookieKV = cookieKVStr.split("=");
            if(cookieKV.length === 2 && cookieKV[0] === COOKIES_SESSION_KEY){
                return cookieKV[1];
            }
        }
        return false
    }

    _removeSession(sessionID){
        this.#sessionMap.delete(sessionID);
    }

    _updateEntryID(oldID, newID){
        let entry = this.#sessionMap.get(oldID);
        if(entry !== undefined){
            this.#sessionMap.delete(oldID);
            this.#sessionMap.set(newID, entry);
        }
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
        this.#ID = SessionEntry.#generateID();
        this.#data = new Map();
        this.#initializeTime = Date.now();
        this.#refreshTime = this.#initializeTime;
    }
    static #generateID(){
        let uuid = crypto.randomUUID().replace("-","");
        let hexUUID = "";
        for(let i = 0 ; i < uuid.length ; i++){
            let hex = uuid.charCodeAt(i).toString(16);
            hexUUID += ("0"+hex).slice(-2);
        }
        return hexUUID;
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

    destroy(){
        this.#sessionController._removeSession(this.#ID)
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

module.exports = {
    SessionEntry: SessionEntry,
    SessionController: SessionController,
    sessionController: new SessionController(5000)
};