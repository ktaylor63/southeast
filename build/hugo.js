(function () {
  'use strict';

  var rimraf = require('rimraf');
  var spawn = require('child_process').spawn;
  var chokidar = require('chokidar');


  if (process.env.WATCH) watcher();
  else {
    rimraf('dist/*', function (err) {
      if (err) console.error(err);
      hugo();
    });
  }

  function watcher() {
    chokidar.watch('site/**/*', {
      ignoreInitial: true
    }).on('all', hugo);
  }

  function hugo() {
    var hugo = spawn('hugo', [
      '--canonifyURLs=true',
      '--config=site/config.yml',
      '--destination=../dist/',
      '--source=site/',
      '--baseURL=' + process.argv[3]
    ]);

    hugo.stdout.on('data', function (data) {
      console.log(data.toString('utf8'));
    });

    hugo.stderr.on('data', function (data) {
      console.error(data.toString('utf8'));
    });
  }
})();
