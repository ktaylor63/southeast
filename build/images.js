(function () {
  'use strict';
  var sharp = require('sharp');
  var Imagemin = require('imagemin');
  var rimraf = require('rimraf');
  var rename = require('gulp-rename');
  var fs = require('fs');
  var path = require('path');

  var input = 'src/images/pages/';
  var output = 'site/static/images/pages/';
  var directories = getDirectories(input);
  var images;

  rimraf(output + '/*', function (err) {
    if (err) console.error(err);

    directories.forEach(function (size) {
      var currentDir = input + size + '/';
      images = fs.readdirSync(currentDir);

      // If there's a DS Store item, remove it
      var i = images.indexOf('.DS_Store');
      if (i > -1) images.splice(i,1);

      images.forEach(function (name) {
        var sizeInt = parseInt(size);
        var img = sharp(currentDir + name);
        img
          .resize(sizeInt)
          .toBuffer(function (err, buffer, info) {
            if (err) console.error(err);
            imagemin(buffer, output, name);
          });
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

  function getDirectories(srcPath) {
    return fs.readdirSync(srcPath).filter(function(file) {
      return fs.statSync(path.join(srcPath, file)).isDirectory();
    });
  }

})();
