(function () {
  'use strict';

  const rimraf = require('rimraf');
  const spawn = require('child_process').spawn;

  const baseURL = process.argv[3];

  // Don't blast away CSS, JavaScript, or Images or we'll have to just re-copy them
  const options = { glob: { ignore: ['dist/css', 'dist/js', 'dist/images', 'dist/data'] } };

  rimraf('dist/*', options, function (err) {
    if (err) console.error(err);
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
  });

})();
