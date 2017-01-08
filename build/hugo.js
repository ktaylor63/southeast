(function () {
  'use strict';

  const spawn = require('child_process').spawn;
  const baseURL = process.argv[3];

  var hugo = spawn('hugo', [
    '--canonifyURLs=true',
    '--config=site/config.yml',
    '--destination=../dist/',
    '--source=site/',
    `--baseURL=${baseURL}`
  ]);

  hugo.stdout.on('data', function (data) {
    console.log(data.toString('utf8'));
  });

  hugo.stderr.on('data', function (data) {
    console.error(data.toString('utf8'));
  });

})();
