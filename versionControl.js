var updates = {
    "0.5.1": [
        "https://raw.githubusercontent.com/denys00/alchdev/master/version0_5_1/inits.js",
        "https://raw.githubusercontent.com/denys00/alchdev/master/version0_5_1/fantom.js",
        "https://raw.githubusercontent.com/denys00/alchdev/master/version0_5_1/groupblock.js",
        "https://raw.githubusercontent.com/denys00/alchdev/master/version0_5_1/saveload.js",
        "https://raw.githubusercontent.com/denys00/alchdev/master/version0_5_1/border.js"
    ]
}

var head = document.getElementsByTagName('head')[0];
var scripts = updates[settings.version];

function createScriptElement(src) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = src;
    return script;
}

for (link in scripts)
    head.appendChild(createScriptElement(link));