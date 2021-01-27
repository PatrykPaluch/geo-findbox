const DOM_CLASS_USER_NICK = ".data-user-nick";
const DOM_CLASS_USER_EMAIL= ".data-user-email";
const DOM_CLASS_USER_CREATE_TIME = ".data-user-create-time";

const DOM_CLASS_FINDBOX_NAME= ".data-findbox-name";
const DOM_CLASS_FINDBOX_CREATE_TIME = ".data-findbox-create-time";
const DOM_CLASS_FINDBOX_DESCRIPTION = ".data-findbox-description";
const DOM_CLASS_FINDBOX_AUTHOR = ".data-findbox-author";
const DOM_CLASS_FINDBOX_GEO_LOCATION = "data-findbox-author";
const DOM_CLASS_FINDBOX_LOG_COUNT = ".data-findbox-log-count"

const DOM_CLASS_FINDBOX_STATUS_TEXT = ".data-findbox-status-text";
const DOM_CLASS_FINDBOX_STATUS_ICON = ".data-findbox-status-icon";

const DOM_CLASS_USERLOG_FOUND = ".data-userlog-found";
const DOM_CLASS_USERLOG_COMMENT = ".data-userlog-comment";
const DOM_CLASS_USERLOG_CREATE_TIME = ".data-userlog-create-time";
const DOM_CLASS_USERLOG_AUTHOR = ".data-userlog-author";
const DOM_CLASS_USERLOG_FINDBOX = ".data-userlog-findbox";


const DOM_ID_NEWEST_FINDBOX_CONTAINER = "newest-findboxes-container";
const DOM_ID_MY_FINDBOX_CONTAINER = "my-findboxes-container";

const DOM_ID_ALL_NEWEST_FINDBOX_CONTAINER = "found-findboxes-all-container";
const DOM_ID_ALL_MY_FINDBOX_CONTAINER = "my-findboxes-all-container"

// =============================================== Templates
/** @type {HTMLTemplateElement} */
let templateFindboxEntry;
/** @type {HTMLTemplateElement} */
let templateCommentEntry;

// =============================================== Global variables
/** @type {User} */
let currentUser = undefined;

// =============================================== Load
function onLoad(){
    getTemplates();
    preparePopups();
}

function getTemplates(){
    templateFindboxEntry = document.getElementById("template-findbox-entry");
    templateCommentEntry = document.getElementById("template-comment-entry");
}

function preparePopups(){
    let popupList = document.querySelectorAll(".popup");
    for(let popup of popupList){
        const id = popup.id;
        const inner = popup.children[0];
        popup.addEventListener('click', e=>{
           hidePopup(id);
           e.stopPropagation();
        });
        inner.addEventListener('click', e=>{
           e.stopPropagation();
        });
    }
}

// =============================================== CLASSES

class User {
    _id;
    _nick;
    _createTime;
    _email;
    constructor(id, nick, createTime, email) {
        this._id = id;
        this._nick = nick;
        this._createTime = createTime;
        this._email = email;
    }

    putInDOM(parent){
        foreachSet(parent.querySelectorAll(DOM_CLASS_USER_NICK), this.nick);
        foreachSet(parent.querySelectorAll(DOM_CLASS_USER_CREATE_TIME), formatDate(this.createTime));
        if(this.email)
            foreachSet(parent.querySelectorAll(DOM_CLASS_USER_EMAIL), this.email);
    }

    /** @returns {User} */
    static createFromJson(json){
        let user = UserCache.get(json.user_id);
        if(user)
            return user;

        return UserCache.set(
            new User(json.user_id, json.nick, new Date(json.registration_date), json.email)
        );
    }

    get id(){ return this._id; }
    get nick(){ return this._nick; }
    get email(){ return this._email; }
    get createTime(){ return this._createTime; }
}

class Findbox {
    _id;
    _name;
    _author;
    _logCount;
    _createTime;
    _geoLocation;
    _description;
    constructor(id, name, author, logcount, createTime, geoLocation, description) {
        this._id = id;
        this._name = name;
        this._author = author;
        this._logCount = logcount;
        this._createTime = createTime;
        this._geoLocation = geoLocation;
        this._description = description;
    }

    putInDOM(parent) {
        foreachSet(parent.querySelectorAll(DOM_CLASS_FINDBOX_NAME), this.name);
        foreachSet(parent.querySelectorAll(DOM_CLASS_FINDBOX_CREATE_TIME), formatDate(this.createTime));
        foreachSet(parent.querySelectorAll(DOM_CLASS_FINDBOX_GEO_LOCATION), this.geoLocation);
        foreachSet(parent.querySelectorAll(DOM_CLASS_FINDBOX_DESCRIPTION), this.description);
        foreachSet(parent.querySelectorAll(DOM_CLASS_FINDBOX_LOG_COUNT), this.logCount);
        let userFieldList = parent.querySelectorAll(DOM_CLASS_FINDBOX_AUTHOR);
        for(let userField of userFieldList)
            this.author.putInDOM(userField);
    }

    /** @returns {Findbox} */
    static createFromJson(json){
        let id = json.findbox_id;

        let findbox = FindboxCache.get(id);
        if(findbox && findbox.description.length === json.description.length)
            return findbox;

        let author = UserCache.get(json.author.user_id);
        if(!author) author = UserCache.set(json.author);

        return FindboxCache.set(new Findbox(
            json.findbox_id,
            json.name,
            author,
            json.log_count,
            new Date(json.create_time),
            json.geoLocation,
            json.description
        ));
    }

    get id(){ return this._id; }
    get name(){ return this._name; }
    get author(){ return this._author; }
    get logCount(){ return this._logCount; }
    get createTime(){ return this._createTime; }
    get geoLocation(){ return this._geoLocation; }
    get description(){ return this._description; }
}

class UserLog {
    _id;
    _user;
    _found;
    _findbox;
    _comment;
    _createTime;

    constructor(id, user, found, findbox, comment, creationTime) {
        this._id = id;
        this._user = user;
        this._found = found;
        this._findbox = findbox;
        this._comment = comment;
        this._createTime = creationTime;
    }

    putInDOM(parent) {
        foreachSet(parent.querySelectorAll(DOM_CLASS_USERLOG_COMMENT), this.comment);
        foreachSet(parent.querySelectorAll(DOM_CLASS_USERLOG_CREATE_TIME), formatDate(this.createTime));
        foreachSet(parent.querySelectorAll(DOM_CLASS_USERLOG_FOUND), this.foundString);

        let userFieldList = parent.querySelectorAll(DOM_CLASS_USERLOG_AUTHOR);
        for(let userField of userFieldList)
            this.user.putInDOM(userField);

        let findboxFieldList = parent.querySelectorAll(DOM_CLASS_USERLOG_FINDBOX);
        for(let findboxField of findboxFieldList)
            this.findbox.putInDOM(findboxField);
    }

    /** @returns {UserLog} */
    static createFromJson(json){
        let id = json.userlog_id;
        let userLog = UserLogCache.get(id);
        if(userLog)
            return userLog;

        let user = UserCache.get(json.user.user_id);
        if(!user) user = UserCache.set(json.user);

        let findbox = FindboxCache.get(json.findbox.findbox_id);
        if(!findbox) findbox = FindboxCache.set(json.findbox);

        return UserLogCache.set(new UserLog(
            json.userlog_id,
            user,
            json.found,
            findbox,
            json.comment,
            new Date(json.create_time)
        ));

    }

    get id(){ return this._id; }
    get user(){ return this._user; }
    get found(){ return this._found; }
    get findbox(){ return this._findbox; }
    get comment(){ return this._comment; }
    get createTime(){ return this._createTime; }
    get foundString(){ return this._found ? "Found" : "Not found"; }
}

/**
 * @template {{id:number}} T
 */
class DataCache {
    _mapCache;

    constructor() {
        this._mapCache = new Map();
    }

    /**
     * @param {T} field
     * @returns {T} param field
     */
    set(field){
        this._mapCache.set(field.id, field);
        return field;
    }

    get(id){
        return this._mapCache.get(id);
    }

    /**
     * @param {T | number} field
     */
    has(field){
        if(typeof field !== "number")
            field = field.id;
        return this._mapCache.has(field);
    }

    clear(){
        this._mapCache.clear()
    }
}


const UserCache = new DataCache();
const FindboxCache = new DataCache();
const UserLogCache = new DataCache();

function foreachSet(nodeList, value, asHTML = false){
    for(let node of nodeList){
        if(asHTML)
            node.innerHTML = value;
        else
            node.innerText = value;
    }
}


// =============================================== Functions
/**
 * @callback apiCallback
 * @param {object} json
 * @param {number} code
 */

/**
 * @param {string} page
 */
function redirect(page){
    window.location = page;
}

async function postAPI(body){
    if(typeof body !== "string")
        body = JSON.stringify(body);

    console.log(body);
    return await fetch("/api", {
        method: "POST",
        credentials: 'include',
        headers: {
            "Content-Type": "application/json"
        },
        body: body
    });
}

/**
 *
 * @param {object | string} body
 * @param {apiCallback} onError
 * @param {apiCallback} onSuccess
 */
function api(body, onError, onSuccess){
    postAPI(body)
        .then((response)=>{
            const ok = response.ok;
            const status = response.status;
            response.json().then(value => {
                if(response.ok)
                    onSuccess(value, response.status);
                else
                    onError(value, response.status);
            }).catch()
        })
        .catch(console.log);
}

function putError(elem, json){
    if(json.error) {
        let error;
        if (typeof json.error === "string")
            error = json.error;
        else
            error = json.error.join("<br>");
        elem.innerHTML = error;
    }
}

// =============================================== Page functions


function pageProcessProfile(){
    setCurrentUser((currentUser)=>{
        let url = new URL(document.URL)
        let profileUserId = url.searchParams.get("id");
        let openPopup = url.searchParams.get("popup")

        if(profileUserId === null)
            profileUserId = currentUser.id;

        setUserProfile(profileUserId);
        setMyFindboxes(profileUserId);
        setFoundFindboxes(profileUserId);

        if(openPopup === "ifound")
            showFondFindboxList();
        else if(openPopup === "my")
            showMyFindboxList();

        if(openPopup !== null){ //remove "popup" param
            let newurl = url.href.split("?").shift();
            if(profileUserId !== currentUser.id)
                newurl += "?id="+profileUserId;

            window.history.replaceState(null, "", newurl);
        }

    });
}

function pageProcessFindbox(){
    setCurrentUser( (currentUser)=>{
        let findboxId = new URL(document.URL).searchParams.get("id");
        if(findboxId === null){
            redirect("/profile.html");
            return;
        }
        findboxId = parseInt(findboxId);

        getFindbox(findboxId, (findboxJson)=>{
            getUserLogsForFindbox(findboxId, (userLogsJson)=>{
                setFindboxPage(findboxJson, userLogsJson);
            });
        });
    });
}

function setFindboxPage(findboxJson, userLogListJson){
    console.log(findboxJson, userLogListJson)
    let findboxElem = document.querySelector(".findbox-info");
    let findboxUserLogsElem = document.querySelector(".comment-container");
    let findbox = Findbox.createFromJson(findboxJson);
    let userLogList = userLogListJson.userLogList.map( logJson => UserLog.createFromJson(logJson) );


    let currentFoundThis = false;

    findbox.putInDOM(findboxElem);
    for(let userLog of userLogList){
        if(userLog.user.id === currentUser.id){
            currentFoundThis |= userLog.found;
        }
        addUserLogEntry(findboxUserLogsElem, userLog);
    }


    let icon = findboxElem.querySelector(".data-findbox-status-icon");
    icon.classList.add(currentFoundThis ? "fa-check-square" : "fa-square");
    icon.style.color = currentFoundThis ? "green" : "red";
}


// =============================================== Page utils
function processLogin(formId){
    const form = document.forms[formId];
    const errorBox = form.querySelector(".error-box");
    const nick = form['nick'].value;
    const password = form['password'].value;

    api({service:'login', nick: nick, password: password},
        (json, code) => {
            putError(errorBox, json);
        },
        (json, code) => {
            redirect("/profile.html");
        });
}

function processRegister(formId){
    const form = document.forms[formId];
    const errorBox = form.querySelector(".error-box");
    const nick = form['nick'].value;
    const password = form['password'].value;
    const passwordRepeat = form['password_repeat'].value;
    const email = form['email'].value;
    const license = form['license_accept'].checked;

    api({
            service:'register',
            nick: nick,
            password: password,
            password_repeat: passwordRepeat,
            email: email,
            license_accept: license
        },
        (json, code) => {
            putError(errorBox, json);
        },
        (json, code) => {
            redirect("/login.html");
        });
}


function getCurrentUser( callback ){
    api({service: "currentUser"},
        (json, code) => {
            redirect("/login.html");
        },
        (json, code) => {
            callback(json);
        });
}

function getUser(id, callback){
    api({service: 'getUser', user_id: id},
        (json, code)=>{
            redirect("/profile.html");
        },
        (json, code) => {
            callback(json);
        })
}

function setCurrentUser( callback ) {
    getCurrentUser((json)=>{
        let user = User.createFromJson(json);
        currentUser = user;
        user.putInDOM(document.querySelector(".panel-left"));
        callback(currentUser);
    });
}

function setUserProfile(id) {
    getUser(id, (json)=>{
        let user = User.createFromJson(json);
        user.putInDOM(document.querySelector(".panel-right .about"));
    });
}

function getFindbox(id, callback){
    api({
        service: 'getFindbox',
        findbox_id: id
    }, (json, code) => {
        redirect("/profile.html");
    }, (json, code) => {
       callback(json);
    });
}

function getUserLogsForFindbox(id, callback){
    api({
        service: 'getUserLog',
        findbox_id: id
    }, (json, code) => {
        console.log(code, json);
    }, (json, code) => {
        callback(json);
    });
}


function setMyFindboxes(userId){
    api({
        service: 'getFindboxList',
        user_id: userId,
        limit: 10
    }, (json, code) => {
        //do nothing
    }, (json, code) => {
        console.log(json);
        let findboxList = json.findboxList.map(findboxJson => Findbox.createFromJson(findboxJson));
        let findboxContainer = document.getElementById(DOM_ID_MY_FINDBOX_CONTAINER)
        let popupFindboxContainer = document.getElementById(DOM_ID_ALL_MY_FINDBOX_CONTAINER);
        let i = 0;
        for(let findbox of findboxList){
            if(i++ < 5)
                addFindboxEntry(findboxContainer, findbox);

            addFindboxEntry(popupFindboxContainer, findbox);
        }

    });
}

function setFoundFindboxes(userId){
    api({
        service: "getUserLog",
        user_id: userId,
        limit: 100
    }, (json, code) => {
        //do nothing
    }, (json, code) => {
        let findboxList = json.userLogList.map(userLog => Findbox.createFromJson(userLog.findbox));
        let findboxContainer = document.getElementById(DOM_ID_NEWEST_FINDBOX_CONTAINER);
        let popupFindboxContainer = document.getElementById(DOM_ID_ALL_NEWEST_FINDBOX_CONTAINER);
        let i = 0;
        for(let findbox of findboxList){
            if(i++ < 5)
                addFindboxEntry(findboxContainer, findbox);

            addFindboxEntry(popupFindboxContainer, findbox);
        }
    });
}


function addFindboxEntry(parent, findbox){
    const findboxElem = templateFindboxEntry.content.firstElementChild.cloneNode(true);
    findbox.putInDOM(findboxElem)
    const id = findbox.id;
    findboxElem.addEventListener('click', ev => {
        redirect(`/findbox.html?id=${id}`);
    });

    parent.appendChild(findboxElem);
}

/**
 *
 * @param parent
 * @param {UserLog} userLog
 */
function addUserLogEntry(parent, userLog){
    const userCommentElem = templateCommentEntry.content.firstElementChild.cloneNode(true);
    userLog.putInDOM(userCommentElem);
    const userId = userLog.user.id;
    userCommentElem.querySelector(".comment-author").addEventListener('click', evt => {
        redirect(`/profile.html?id=${userId}`);
    });

    parent.appendChild(userCommentElem);
}

// =============================================== Popup
function showMyFindboxList(){
    showPopup("popup-my-findboxes");
}
function showFondFindboxList(){
    showPopup("popup-found-findboxes");
}

function showCurrentUserMyFindboxList(){
    if(redirectToCurrentUserFindboxList("my"))
        return;

    showMyFindboxList();
}


function showCurrentUserFoundFindboxList(){
    if(redirectToCurrentUserFindboxList("ifound"))
        return;

    showFondFindboxList();
}


function redirectToCurrentUserFindboxList(type){
    let url = new URL(document.URL);
    if(!url.pathname.includes("profile.html") || url.searchParams.get("id") !== null){
        redirect("profile.html?popup="+type);
        return true;
    }
    return false
}


function showPopup(id){
    let popup = document.getElementById(id);
    if(popup.classList.contains("popup-show"))
        return;


    popup.classList.add("popup-show");
    popup.classList.add("popup-display-for-anim");
}

function hidePopup(id){
    let popup = document.getElementById(id);
    if(!popup.classList.contains("popup-show"))
        return;

    popup.classList.remove("popup-show");
    setTimeout(()=>{
        popup.classList.remove("popup-display-for-anim");
    }, 750);
}

// =============================================== Other utils

function formatDate(date){
    if(typeof date === "string" || typeof date === "number")
        date = new Date(date);

    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let H = date.getHours();
    let M = date.getMinutes();


    month = twoDigit(month);
    H = twoDigit(H);
    M = twoDigit(M);

    return `${year}-${month}-${day} ${H}:${M}`;
}

function twoDigit(d){
    if(d < 10)
        return "0" + d;
    return "" + d;
}

