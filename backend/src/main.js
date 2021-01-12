const HttpServe = require("./HttpServe/HttpServe")
const Path = require("path")
const FileRouter = require("./HttpServe/FileRouter");
const BodyToJson = require("./HttpServe/BodyToJson");
const UrlEncodedProcessor = require('./HttpServe/UrlEncodedProcessor');

const PrintBody = require('./Testing/PrintBody');


let serve = new HttpServe(Path.join(__dirname, "../../frontend/public_html/"));

serve.addProgram(new PrintBody('1'), 110);
serve.addProgram(new BodyToJson(true, true, false),100);
serve.addProgram(new PrintBody('2'), 90);
serve.addProgram(new UrlEncodedProcessor(), 80);
serve.addProgram(new PrintBody('3'), 70);


serve.addProgram(new FileRouter("/css", "/css"), 10);
serve.addProgram(new FileRouter("/img", "/img"), 10);
serve.addProgram(new FileRouter("/", "/pages"),  9);

serve.listen(8080);


