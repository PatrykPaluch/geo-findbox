

class Api {

    /** @type {ApiRouter} */
    #router;


    constructor(router) {
        this.#router = router;

        this.#initializeRoutes();
    }

    #initializeRoutes(){
        let r = this.#router;
        r.addRoute("ping", new (require("./Poke"))());
    }


    get router(){
        return this.#router;
    }

}

module.exports = Api;

