(function () {
  'use strict';

  var rimraf = require('rimraf');

  rimraf('dist/*', function (err) {
    if (err) console.error(err);

    var spawn = require('child_process').spawn;
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

  });
})();
