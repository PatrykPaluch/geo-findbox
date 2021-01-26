const crypto = require("crypto");

global.SALT = "s7dD3c80";

global.SESSION_KEY_LOGGED = "isLogged";
global.SESSION_KEY_USER_ID = "loggedUserID";
global.STATUS_LOGGED = true;
global.STATUS_NOT_LOGGED = false;

global.processInternalError = (res)=>{
    responseEnd(res, 500, {
        error: "Server error"
    });
}

global.validateEmail = (email)=>{
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

/**
 * Automatically adds SALT to password
 * @param {string} pass - password to hash
 * @param {string} additionalSalt - additional salt to password
 * @returns {string} hashed password
 */
global.hashPassword = (pass, additionalSalt)=>{
    let cryptoHash = crypto.createHash("sha512");
    cryptoHash.update(additionalSalt + pass + SALT);
    return cryptoHash.digest('hex');
}

global.responseEnd = (res, code, obj) => {
    res.writeHead(code);
    res.write(JSON.stringify(obj));
    res.end();
}

/**
 * @param {module:http.ServerResponse} res
 * @param {SessionEntry} sessionEntry
 * @returns {boolean} true if user is logged; false otherwise
 */
global.processLoggedCheck = (res, sessionEntry, )=>{
    let isLogged = sessionEntry.getData(SESSION_KEY_LOGGED);
    if(!isLogged){
        responseEnd(res, 401, {
            "error": "Wymagane zalogowanie",
            "redirect": "/login.html"
        });
        return false;
    }
    return true;
}

/**
 * @param {module:http.ServerResponse} res
 * @param {string[]} errorMessages
 * @returns {boolean} true if error was send; false otherwise
 */
global.sendErrors = (res, errorMessages) => {
    if (errorMessages.length !== 0) {
        responseEnd(res, 400, {
            error: errorMessages
        });
        return true;
    }
    return false;
}

global.checkId = (id)=>{
    return id !== undefined && id > 0;
}
