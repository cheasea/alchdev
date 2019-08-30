if (settings.version) {
    var updates = {
        "0.5.1": [
            "version0_5_1/fantom.js",
            "version0_5_1/groupblock.js",
            "version0_5_1/saveload.js",
            "version0_5_1/border.js",
            "version0_5_1/inits.js"
        ]
    }

    var head = document.getElementsByTagName('head')[0];
    var scripts = updates[settings.version];

    function createScriptElement(src) {
        var script = document.createElement("script");
        script.src = "https://denys00.github.io/alchdev/version0_5_1/" + src;
        return script;
    }

    for (link of scripts)
        head.appendChild(createScriptElement(link));
}