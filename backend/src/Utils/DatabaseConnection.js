
const Logger = require("../Utils/Logger").mainLogger;
const fs = require('fs');
const path = require('path')
const {Client} = require('pg');

const databaseConfigurationFileName = "../databaseConfiguration.json";
const databaseConfigurationFilePath = path.join(__dirname, databaseConfigurationFileName);

const TAG = "DatabaseConnection";

function logBadConfigurationFatal(){
    Logger.logF(TAG, "Missing or wrong database configuration!");
    Logger.logF(TAG, `Check ${databaseConfigurationFilePath}`);
    process.exit(1);
}

function checkConfigurationFile(){
    if(!fs.existsSync(databaseConfigurationFilePath)){
        fs.writeFileSync(databaseConfigurationFilePath, JSON.stringify({
            host: '',
            user: '',
            password: '',
            database: '',
            port: 5432,
        }, null, 2));

        return false;
    }

    let databaseConfiguration = require(databaseConfigurationFilePath);
    const configurationProperties = ["host", "user", "password", "database", "port"];
    let missingData = false;
    for(const confProp of configurationProperties){
        if(!databaseConfiguration.hasOwnProperty(confProp)){
            missingData = true;
            Object.defineProperty(databaseConfiguration, confProp, {
                value: (confProp==="port" ? 5432 : ""),
                writable: true,
                enumerable: true
            });
        }
    }
    if(missingData){
        fs.writeFileSync(databaseConfigurationFilePath, JSON.stringify(databaseConfiguration, null,2));
        return false;
    }

    return databaseConfiguration;
}

let databaseConfiguration = checkConfigurationFile();
if(databaseConfiguration === false){
    logBadConfigurationFatal();
    return;
}
const client = new Client({
    host: databaseConfiguration.host,
    port: databaseConfiguration.port,
    user: databaseConfiguration.user,
    password: databaseConfiguration.password,
    database: databaseConfiguration.database
});

async function initDB(){
    try {
        await client.connect();
    }catch (e){
        Logger.logF(TAG, "Postgresql connect error");
        Logger.logF(TAG, `Check ${databaseConfigurationFilePath}`);
        Logger.logE(TAG, e);
        return false
    }

    return true;
}

client.initDBConnection = initDB;

module.exports = client;
