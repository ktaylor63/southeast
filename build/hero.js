(function () {
  'use strict';
  var sharp = require('sharp');
  var Imagemin = require('imagemin');
  var rimraf = require('rimraf');
  var rename = require('gulp-rename');
  var fs = require('fs');

  var input = 'src/images/hero/';
  var output = 'site/static/images/hero/';
  var images = fs.readdirSync(input);
  var outSize = 1400;

  rimraf(output, function () {
    // If there's a DS Store item, remove it
    var i = images.indexOf('.DS_Store');
    if (i > -1) images.splice(i,1);

    // Ensure the output dir exists
    images.forEach(function (name) {
      var img = sharp(input + name);
      img
        .resize(outSize)
        .toBuffer(function (err, buffer, info) {
          if (err) console.error(err);
          imagemin(buffer, output, name);
        });
    });
  });

  function imagemin (buffer, dist, name) {
    new Imagemin()
      .src(buffer)
      .dest(output)
      .use(Imagemin.jpegtran({progressive: true}))
      .use(rename(name))
      .run(function (err, files) {
        if (err) console.error(err);
      });
  }

})();
