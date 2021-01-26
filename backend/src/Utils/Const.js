const crypto = require("crypto");

global.SALT = "s7dD3c80";

global.SESSION_KEY_LOGGED = "isLogged";
global.SESSION_KEY_USER_ID = "loggedUserID";

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