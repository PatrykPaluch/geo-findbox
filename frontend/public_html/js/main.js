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
            });
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

function setCurrentUser() {
    getCurrentUser((json)=>{
        console.log(json);
        const nick = json.nick;
        const email = json.email;
        const createTime = parseDate(json.registration_date);
        const elem = document.querySelector(".user-data");
        const elemNick = elem.querySelector(".user-nick");
        const elemEmail = elem.querySelector(".user-email");
        const elemCreateTime = elem.querySelector(".user-create-time");

        elem.setAttribute("user_id", json.user_id);
        elemNick.innerText = nick;
        elemEmail.innerText = email;
        elemCreateTime.innerText = createTime;
    });
}

function parseDate(date){
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