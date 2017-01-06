(function () {
  'use strict';

  var mkdirp = require('mkdirp');

  var directories = [
    'dist/js',
    'dist/data',
    'dist/css',
    'dist/images/hero',
    'dist/images/pages',
    'data/data'
  ];

  directories.forEach(function (path) {
    mkdirp(path, function (err) {
      if (err) console.error(err);
    });
  });
})();
