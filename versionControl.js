function versionCheck() {
  if (!settings.version) return;

  if (settings.version === "last") settings.version = "0.5.2";

  let updates = {
    "0.5.2": ["https://denys00.github.io/alchdev/version0_5_2.js"],
    "a0.6": [
      "https://cdn.jsdelivr.net/npm/expr-eval@2.0.2/dist/bundle.js",
      "https://denys00.github.io/alchdev/version0_6.js"
    ]
  };

  let scripts = updates[settings.version];

  if (!scripts) return;

  for (let link of scripts) {
    let script = document.createElement("script");
    script.src = link;
    script.defer = true;
    document.head.appendChild(script);
  }
}

versionCheck();
$("title").text(
  $("title")
    .text()
    .replace("Алхимия 0.5 beta", "Алхимия 0.5.2 patched")
);
