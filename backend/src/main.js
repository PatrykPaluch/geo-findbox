const DB = require("./Utils/DatabaseConnection");

const Logger = require("./Utils/Logger").mainLogger;
const HttpServe = require("./HttpServe/HttpServe")
const Path = require("path")
const FileRouter = require("./HttpServe/FileRouter");
const BodyToJson = require("./HttpServe/BodyToJson");
const UrlEncodedProcessor = require('./HttpServe/UrlEncodedProcessor');
const Api = require("./Api/Api")
const ApiRouter = require("./HttpServe/ApiRouter")

const PrintBody = require('./Testing/PrintBody');

const api = new Api(new ApiRouter("/api"));

async function main(){
    Logger.logLevelConsole = require("./Utils/Logger").LoggerLevel.TRACE;

    let connected = await DB.initDBConnection();
    if(!connected){
        Logger.logF("Main", "Can't connect to database!");
        return;
    }

    let serve = new HttpServe(Path.join(__dirname, "../../frontend/public_html/"));

    serve.addProgram(new BodyToJson(true, true, false),100);
    serve.addProgram(new UrlEncodedProcessor(), 80);


    serve.addProgram(api.router, 20);

    serve.addProgram(new FileRouter("/css", "/css"), 10);
    serve.addProgram(new FileRouter("/img", "/img"), 10);
    serve.addProgram(new FileRouter("/js", "/js"),   10);
    serve.addProgram(new FileRouter("/", "/pages"),  9);

    serve.listen(8080);
    return;
}

main().then().catch();
