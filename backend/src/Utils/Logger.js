const fs = require("fs");

class Logger {

    static generateFileName(){
        let time =
            new Date().toISOString()
                .replace(/T/, ' ')      // replace T with a space
                .replace(/\..+/, '');
        return `GeoFindbox-${time}.log`;
    }

    /** @type {LoggerLevel} */
    #fileLevel;
    /** @type {LoggerLevel} */
    #consoleLevel;

    /** @type {String} */
    #file;
    /** @type {fs.WriteStream} */
    #fileStream;

    /** @type {String} */
    #latestFile;
    /** @type {fs.WriteStream} */
    #latestFileStream;


    #closed;
    /**
     *
     * @param {String} file
     * @param {LoggerLevel} initFileLevel
     * @param {LoggerLevel} initConsoleLevel
     * @param {boolean} useLatestFile
     */
    constructor(file, initFileLevel = LoggerLevel.ALL, initConsoleLevel = LoggerLevel.Debug, useLatestFile = false ) {
        this.#closed = false;
        this.#file = file;
        this.#fileLevel = initFileLevel;
        this.#consoleLevel = initConsoleLevel;

        if(!fs.existsSync("logs"))
            fs.mkdirSync("logs");

        this.#fileStream = fs.createWriteStream(`logs/${this.#file}`, {
            flags: 'a',
            autoClose: true,
        });

        if(useLatestFile){
            this.#latestFile = "GeoFindbox-latest.log"
            this.#latestFileStream = fs.createWriteStream(`logs/${this.#latestFile}`, {
                flags: 'w',
                autoClose: true,
            });
        }
        else {
            this.#latestFile = null;
        }
    }

    set logLevelFile(level) {
        this.#fileLevel = level;
    }
    get logLevelFile(){
        return this.#fileLevel;
    }

    set logLevelConsole(level) {
        this.#consoleLevel = level;
    }
    get logLevelConsole(){
        return this.#consoleLevel;
    }

    get isClosed(){
        return this.#closed;
    }
    
    /**
     * Logs Trace Level
     * @param {String} tag
     * @param {String} log
     */
    logT(tag, log){
        this.logLevel(LoggerLevel.TRACE, tag, log);
    }

    /**
     * Logs Debug Level
     * @param {String} tag
     * @param {String} log
     */
    logD(tag, log){
        this.logLevel(LoggerLevel.DEBUG, tag, log);
    }

    /**
     * Logs Info Level
     * @param {String} tag
     * @param {String} log
     */
    logI(tag, log){
        this.logLevel(LoggerLevel.INFO, tag, log);
    }

    /**
     * Logs Warning Level
     * @param {String} tag
     * @param {String} log
     */
    logW(tag, log){
        this.logLevel(LoggerLevel.WARN, tag, log);
    }

    /**
     * Logs Error Level
     * @param {String} tag
     * @param {String} log
     */
    logE(tag, log){
        this.logLevel(LoggerLevel.ERROR, tag, log);
    }

    /**
     * Logs Fatal Level
     * @param {String} tag
     * @param {String} log
     */
    logF(tag, log){
        this.logLevel(LoggerLevel.FATAL, tag, log);
    }


    /**
     * @param {LoggerLevel} level
     * @param {String} key
     * @param {String} log
     */
    logLevel(level, key, log){
        let formatted = this.formatMessage(level, key, log);
        if(this.checkConsoleLevel(level))
            console.log(formatted);

        if(this.checkFileLevel(level)){
            this.#writeToFile(formatted);
            this.#writeToFile("\n");
        }
    }

    #writeToFile(str){
        this.#fileStream.write(str);
        if(this.#latestFileStream != null){
            this.#latestFileStream.write(str);
        }
    }

    formatMessage(level, tag, log) {
        let date = new Date();
        // let ms = date.getMilliseconds();
        let time =
            date.toISOString()
            .replace(/T/, ' ')      // replace T with a space
            .replace(/\..+/, '');

        let strLvl = `${LoggerLevel.toString(level)}`.padStart(5);
        return `${time} ${strLvl} [${tag}] ${log}`;
    }

    checkConsoleLevel(level) {
        return level <= this.#consoleLevel;
    }

    checkFileLevel(level) {
        return level <= this.#fileLevel;
    }


    loggerClose() {
        if(this.#closed)
            return;

        this.#closed = true;

        this.#fileStream.close();
        if(this.#latestFileStream != null){
            this.#latestFileStream.close();
        }
    }
}

let LoggerLevel = Object.freeze({
    "ALL":   255,
    "TRACE": 32,
    "DEBUG": 16,
    "INFO":  8,
    "WARN":  4,
    "ERROR": 2,
    "FATAL": 1,
    "OFF":   0,
    255:  "ALL",
    32:   "TRACE",
    16:   "DEBUG",
    8:    "INFO",
    4:    "WARN",
    2:    "ERROR",
    1:    "Fatal",
    "toString": function (value){
        return this[value];
    }
});

let mainLogger = new Logger(Logger.generateFileName(), LoggerLevel.ALL, LoggerLevel.DEBUG, true);

module.exports = {};
module.exports.Logger = Logger;
module.exports.LoggerLevel = LoggerLevel;
module.exports.mainLogger = mainLogger;