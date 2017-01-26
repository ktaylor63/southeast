(function () {
  'use strict';

  const mkdirp = require('mkdirp');
  const rimraf = require('rimraf');

  const directories = [
    'dist/js',
    'dist/data',
    'dist/css',
    'dist/images/hero',
    'dist/images/pages'
  ];

  // Don't blast away CSS, JavaScript, or Images or we'll have to just re-copy them
  const options = { glob: { ignore: ['dist/css', 'dist/js', 'dist/images', 'dist/data'] } };

  rimraf('dist/*', options, function (err) {
    if (err) console.error(err);

    directories.forEach(function (path) {
      mkdirp(path, function (err) {
        if (err) console.error(err);
      });
    });
  });

})();
