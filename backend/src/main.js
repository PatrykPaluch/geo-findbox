const HttpServe = require("./HttpServe/HttpServe")
const Path = require("path")
const FileRouter = require("./HttpServe/FileRouter");
const BodyToJson = require("./HttpServe/BodyToJson")


let serve = new HttpServe(Path.join(__dirname, "../../frontend/public_html/"));


serve.addProgram(new BodyToJson(true, true, false),100)


serve.addProgram(new FileRouter("/css", "/css"), 10);
serve.addProgram(new FileRouter("/img", "/img"), 10);
serve.addProgram(new FileRouter("/", "/pages"),  9);

serve.listen(8080);


