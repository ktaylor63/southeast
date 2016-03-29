(function () {
  'use strict';
  var sharp = require('sharp');
  var mkdirp = require('mkdirp');
  var Imagemin = require('imagemin');
  var rename = require('gulp-rename');
  var rimraf = require('rimraf');
  var fs = require('fs');

  var input = 'src/images/hero/';
  var output = 'site/static/images/hero/';
  var images = fs.readdirSync(input);
  var sizes = [1100, 800, 400];

  rimraf(output, function () {
    // If there's a DS Store item, remove it
    var i = images.indexOf('.DS_Store');
    if (i > -1) images.splice(i,1);

    // Ensure the output dir exists
    images.forEach(function (name) {
      var dist = output + name.replace('.jpg', '/');

      mkdirp(dist, function (err) {
        if (err) console.error(err);

        sizes.forEach(function(imgSize) {
          var img = sharp(input + name);
          img
            .resize(imgSize)
            .toBuffer(function (err, buffer, info) {
              if (err) console.error(err);
              imagemin(buffer, dist, imgSize);
            });
        });
      });
    });
  });

  function imagemin (buffer, dist, size) {
    new Imagemin()
      .src(buffer)
      .dest(dist)
      .use(Imagemin.jpegtran({progressive: true}))
      .use(rename(size + '.jpg'))
      .run(function (err, files) {
        if (err) console.error(err);
      });
  }

})();
