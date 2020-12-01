const mimedb = require("./ext2mime.json");

module.exports = {
    getMime(extension){
        let mime = mimedb[extension];
        if(mime)
            return mime;

        return false;
    }
}