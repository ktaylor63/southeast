(function () {
  'use strict';
  var sharp = require('sharp');
  var imagemin = require('imagemin');
  var imageminMozjpeg = require('imagemin-mozjpeg');
  var rimraf = require('rimraf');
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
            var filename = output + name;
            minify(buffer, filename);
          });
      });
    });
  });

  function minify(buffer, filename) {
    imagemin.buffer(buffer, filename, {
      plugins: [
        imageminMozjpeg()
      ]
    }).then(function(buffer) {
      fs.writeFile(filename, buffer, 'utf8', function(err) {
        if (err) console.error(err);
      });
    });
  }

  function getDirectories(srcPath) {
    return fs.readdirSync(srcPath).filter(function(file) {
      return fs.statSync(path.join(srcPath, file)).isDirectory();
    });
  }

})();
