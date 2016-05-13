(function () {
  'use strict';

  var jsonminify = require('jsonminify');
  var glob = require('glob');
  var fs = require('fs');
  var path = require('path');

  var jsonSrc = 'src/data/**/*.json';
  var dist = 'site/static/data/';

  glob(jsonSrc, function (err, files) {
    if (err) console.error(err);

    files.forEach(function (file) {
      var basename = path.basename(file).replace('json', 'js');
      var compressed = jsonminify( fs.readFileSync(file, 'utf8') );
      fs.writeFileSync(dist + basename, compressed);
    });
  });

})();
