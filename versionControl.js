let githubRepLink = 'https://cheasea.github.io/alchdev/';

function loadScripts(scripts) {
  if (!scripts || scripts.length === 0) {
    console.log(`Версия загружена (JS): ${settings.version}`)
    return;
  }

  let link = scripts.shift();
  let script = document.createElement('script');
  script.src = githubRepLink + link;
  script.defer = true;
  document.head.appendChild(script);

  script.onload = function () {
    loadScripts(scripts);
  };
}

function loadStyles(styles) {
  if (!styles || styles.length === 0) {
    console.log(`Версия загружена (CSS): ${settings.version}`)
    return;
  }

  styles.forEach((style) => {
    let link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', githubRepLink + style);
    document.head.appendChild(link);
  });
}

function versionCheck() {
  if (!settings.version) return;
  $('#board').hide()
  if (settings.version === 'last') settings.version = '0.5.2';

  let updates = {
    '0.5.2': {
      js: ['version0_5_2.js'],
      css: []
    },
    '0.6': {
      js: [
        'counterParser.js',
        'anime.min.js',
        'interact.js',
        'version0_6/element.js',
        'version0_6/reaction.js',
        'version0_6/conditions.js',
        'version0_6/alch.js',
        'version0_6/selectable.js',
        'version0_6/drag-and-drop.js'
      ],
      css: ['version0_6/borders.css']
    },
    '0.6.1b': {
      js: [
        'selection.js',
        'counterParser.js',
        'anime.min.js',
        'interact.js',
        'version0_6_1/element.js',
        'version0_6_1/reaction.js',
        'version0_6_1/conditions.js',
        'version0_6_1/alch.js',
        'version0_6_1/selectable.js',
        'version0_6_1/drag-and-drop.js'
      ],
      css: ['version0_6_1/borders.css']
    }
  };

  if (!updates[settings.version])
    return;

  let scripts = updates[settings.version].js;
  let styles = updates[settings.version].css;

  loadScripts(scripts);
  loadStyles(styles);
  $('#board').show()
}

versionCheck();
$('title').text(
  $('title').text().replace('Алхимия 0.5 beta', 'Алхимия 0.6.1 beta')
);

let today = new Date();
let month = today.getMonth();
let day = today.getDate();

let winterLogo =
  (month === 11 && day >= 6) || // December 20–31
  (month === 0 && day <= 10);    // January 1–10

if (winterLogo) {
  $('#ingamelogo').css(
    'background',
    `url('${githubRepLink}winterlogo.png') fixed left top no-repeat`
  );
}
