function versionCheck() {
    if (!settings.version) return;
    var updates = {
        "0.5.2": "version0_5_2.js"
    }

    var scripts = updates[settings.version];

    if (!scripts) return;

    var script = document.createElement("script");
    script.src = "https://denys00.github.io/alchdev/" + scripts;

    document.head.appendChild(script);
}

versionCheck();