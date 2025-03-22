let js = {
    addEvent: (element, event, callback) => element.addEventListener(js.eventLu[event], callback),
    alert: (message, title = "Information") => {
        // Set the title and message of the modal
        js.oneText("#alert_dialogLabel", title);
        js.oneText("#alert_dialog .modal-body", message);

        // Open the modal
        let alertModal = new bootstrap.Modal(js.id("alert_dialog"));
        alertModal.show();
    },
    debugLog: (msg) => { if (window.VS_DEBUG_MODE) console.log(msg); },
    eventLu: {
        "Load": "DOMContentLoaded",
        "change": "change",
        "click": "click"
    },
    id: (eid) => document.getElementById(eid),
    idHtml: (id, html) => js.id(id).innerHTML = html,
    isChecked: (id) => {
        js.debugLog(`isChecked id: ${id}`);
        try {
            let e = js.id(id);
            if (e !== null) return e.checked;
        } catch (eek) {
            debugLog(eek);
        }
        return false;
    },
    many: (selector) => document.querySelectorAll(selector),
    one: (selector) => document.querySelector(selector),
    oneText: (selector, text) => document.querySelector(selector).innerText = text,
    randomizeArray: (array) => {
        let inx = array.length, holder, randInx;
        while (0 !== inx) {
            // pick random element
            randInx = Math.floor(Math.random() * inx);
            inx--;
            // swap element
            holder = array[inx];
            array[inx] = array[randInx];
            array[randInx] = holder;
        }
        return array;
    },
    toInt: (value) => {
        var i = 0;
        try {
            let x = parseInt(value);
            if (!isNaN(x)) i = x;
        }
        finally {
            return i;
        }
    },
    val: (selector) => $(selector).val(),
    valToInt: (selector) => js.toInt(js.val(selector)),
};

const ids = {
    "generate": "generate",
    "genLength": "gen_length",
    "genCount": "gen_count",
    "passwordOut": "password_output",
};

let possibleChars = [];
let checkedSets = 0;
let isInitiated = false;
let eventsBound = false;

js.addEvent(document, "Load", (e) => bindEvents());

function bindEvents() {
    js.debugLog("---bindEvents started---");
    if (eventsBound) return;
    js.addEvent(js.id(ids.generate), "click", (e) => {
        js.debugLog("---generate password clicked!---");
        init();
        if (checkedSets < 2) {
            js.alert("Please select at least two character sets to generate passwords."); 
            return;
        }
        let passwordLength = js.valToInt(`#${ids.genLength}`);
        if (passwordLength < 1) {
            js.alert("Please select a password length greater than zero.");
            return;
        }
        let passwordCount = js.valToInt(`#${ids.genCount}`);
        if (passwordCount < 1) {
            js.alert("Please select a password count greater than zero.");
            return;
        }
        //TODO: validate count/length
        let passwords = generatePasswords(passwordLength, passwordCount);
        js.debugLog(`Passwords: ${passwords}`);
        js.idHtml(ids.passwordOut, passwords);
    });
    //bind all checkboxes
    let checkBoxes = js.many(".me-2");
    checkBoxes.forEach((cbox) => {
        if (cbox.type !== "checkbox") return;
        js.addEvent(cbox, "click", (e) => isInitiated = false);
    });
    eventsBound = true;
}

function init() {
    if (isInitiated) return;
    //build possible character list
    possibleChars = [];
    /*
    danger
    number
    upper
    lower
    symbol
    punctuation
    quotes
    brackets
    */
    if (useSet("d")) {
        addSet("!$();\\");
        checkedSets++;
    }
    if (useSet("n")) {
        addSet("01234567890");
        checkedSets++;
    }
    if (useSet("u")) {
        addSet("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
        checkedSets++;
    }
    if (useSet("l")) {
        addSet("abcdefghijklmnopqrstuvwxyz");
        checkedSets++;
    }
    if (useSet("cs")) {
        addSet('~&@@#%^&*-_+=/|');
        checkedSets++;
    }
    if (useSet("p")) {
        addSet("!,.:?");
        checkedSets++;
    }
    if (useSet("q")) {
        addSet("`\"");
        checkedSets++;
    }
    if (useSet("b")) {
        addSet("<>{}[]");
        checkedSets++;
    }
    //radomize charList
    for (let i = 0; i < 5; i++) {
        possibleChars = js.randomizeArray(possibleChars);
    }
    //done
    js.debugLog("---Initialized---");
}

function addSet(set) {
    possibleChars = possibleChars.concat(set.trim().split(""));
}

function useSet(setAbbr) {
    let part = getSetPart(setAbbr);
    let id = `allow_${part}`;
    return js.isChecked(id);
}

function getSetPart(setAbbr) {
    switch (true) {
        case ["d", "D"].includes(setAbbr):
            return "danger";
        case ["n", "N", "#"].includes(setAbbr):
            return "numbers";
        case ["u", "U"].includes(setAbbr):
            return "uppercase";
        case ["l", "L"].includes(setAbbr):
            return "lowercase";
        case ["s", "S", "cs", "CS"].includes(setAbbr):
            return "symbols";
        case ["p", "P"].includes(setAbbr):
            return "punctuation";
        case ["q", "Q"].includes(setAbbr):
            return "quotes";
        case ["b", "B"].includes(setAbbr):
            return "brackets";
        default:
            return "";
    }
}

function getNextChar() {
    js.debugLog(`getNextChar: possibleChars: ${possibleChars.length}`);
    let i = Math.floor(Math.random() * possibleChars.length);
    js.debugLog(`getNextChar: i: ${i}`);
    let nc = possibleChars[i];
    js.debugLog(`getNextChar: nextChar ${nc}`);
    return nc;
}

function getCharType(c) {
    js.debugLog(`c: ${c}`);
    const danger = [33, 36, 40, 41, 59, 92];
    let cc = c.charCodeAt(0);
    switch (true) {
        case danger.includes(cc):
            return "danger";
        case cc >= 48 && cc <= 57:
            return "number";
        case cc >= 65 && cc <= 90:
            return "ucase";
        case cc >= 97 && cc <= 122:
            return "lcase";
        default:
            return "symbol";
    }
}

function generatePasswords(passwordLength, toGenerate = 10) {
    let passwordList = "";
    for (let i = 0; i < toGenerate; i++) {
        let currentPassword = "";
        var lastCharType = "none";
        for (let j = 0; j < passwordLength; j++) {
            let nextChar = getNextChar();
            let ct = getCharType(nextChar);
            js.debugLog(`i: ${i}, j: ${j}, currentPassword: ${currentPassword}, nextChar: ${nextChar}, lastCharType: ${lastCharType}, ct: ${ct}`);
            if (lastCharType != "none" && (lastCharType == ct && lastCharType != "lcase")) {
                let sameType = true;

                while (sameType) {
                    nextChar = getNextChar();
                    ct = getCharType(nextChar);
                    sameType = lastCharType == ct;
                    js.debugLog(`i: ${i}, j: ${j}, currentPassword: ${currentPassword}, nextChar: ${nextChar}, sameType: ${sameType}`);
                }
            }
            currentPassword += nextChar;
            lastCharType = ct;
        }
        passwordList += `${currentPassword}\r\n`;
    }
    return passwordList;
}