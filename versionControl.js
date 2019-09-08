function versionCheck() {
    if (!settings.version) return;
    var updates = {
        "0.5.2": {
            folder: "version0_5_2",
            files: [
                "onSelectStop.js",
                "destroyElement.js",
                "getModId.js",
                "saveOnClick.js",
                "stopGame.js",
                "runGame.js",
                "bodySelectable.js",
                "react.js",
                "onDrop.js",
                "gameInit.js",
                "addElement.js"
            ]
        }
    }

    var head = document.getElementsByTagName('head')[0];
    var scripts = updates[settings.version];

    if (!scripts) return;

    function createScriptElement(src) {
        var script = document.createElement("script");
        script.src = "https://denys00.github.io/alchdev/" + src;
        return script;
    }

    for (name of scripts.files)
        head.appendChild(createScriptElement(sctipts.folder + "/" + name));
}

versionCheck();