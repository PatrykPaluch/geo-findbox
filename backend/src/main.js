const HttpServe = require("./HttpServe/HttpServe")
const Path = require("path")
const Router = require("./HttpServe/Router");

let serve = new HttpServe(Path.join(__dirname, "../../frontend/public_html/"));

serve.addProgram(new Router("/css", "/css"), 10);
serve.addProgram(new Router("/img", "/img"), 10);
serve.addProgram(new Router("/", "/pages"),  9);

serve.listen(8080);


