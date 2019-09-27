function versionCheck() {
    if (!settings.version) return;

    if (settings.version === 'last') settings.version = 'v0.5.2';

    var updates = {
        "v0.5.2": "version0_5_2.js"
    }

    var scripts = updates[settings.version];

    if (!scripts) return;

    var script = document.createElement("script");
    script.src = "https://denys00.github.io/alchdev/" + scripts;
    script.defer = true;

    document.head.appendChild(script);
}

versionCheck();
