

class Api {

    /** @type {ApiRouter} */
    #router;


    constructor(router) {
        this.#router = router;

        this.#initializeRoutes();
    }

    #initializeRoutes(){
        let r = this.#router;
        r.addRoute("ping", new (require("./Programs/Poke"))() );
        r.addRoute("register", new (require("./Programs/Register"))() );
        r.addRoute("login", new (require("./Programs/Login"))() );
        r.addRoute("currentUser", new (require("./Programs/CurrentUser"))() );
        r.addRoute("logout", new (require("./Programs/Logout"))() );

        r.addRoute("createFindbox", new (require("./Programs/CreateFindbox"))() );
        r.addRoute("logFind", new (require("./Programs/LogFind"))() );
        r.addRoute("getFindboxList", new (require("./Programs/GetFindboxList"))() );
        r.addRoute("getFindbox", new (require("./Programs/GetFindbox"))() );

        r.addRoute("getUserLog", new (require("./Programs/GetUserLog"))() );
        r.addRoute("getUser", new (require("./Programs/GetUser"))() );
        //TODO add getLogsFor, getFindbox (single), add latest log and log count to findbox
    }


    get router(){
        return this.#router;
    }

}

module.exports = Api;

