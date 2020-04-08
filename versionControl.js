let githubRepLink = 'https://cheasea.github.io/alchdev/';

function loadScripts(scripts) {
  if (!scripts) return;
  if (scripts.length === 0) return;

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
  if (!styles) return;
  if (styles.length === 0) return;

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

  if (settings.version === 'last') settings.version = '0.5.2';

  let updates = {
    '0.5.2': { js: ['version0_5_2.js'], css: [] },
    '0.6': {
      js: [
        'velocity.js',
        'selection.js',
        'counterParser.js',
        'version0_6/element.js',
        'version0_6/reaction.js',
        'version0_6/conditions.js',
        'version0_6/alch.js',
        'version0_6/selectable.js'
      ],
      css: ['version0_6/borders.css']
    }
  };

  let scripts = updates[settings.version].js;
  let styles = updates[settings.version].css;

  loadScripts(scripts);
  loadStyles(styles);
}

versionCheck();
$('title').text(
  $('title').text().replace('Алхимия 0.5 beta', 'Алхимия 0.6 beta')
);

let winterLogo = false;

if (winterLogo) {
  $('#ingamelogo').css(
    'background',
    `url('${githubRepLink}winterlogo.png') fixed left top no-repeat`
  );
}
