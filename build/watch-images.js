(function () {
  'use strict';
  var sharp = require('sharp');
  var imagemin = require('imagemin');
  var imageminMozjpeg = require('imagemin-mozjpeg');
  var chokidar = require('chokidar');

  var fs = require('fs');
  var path = require('path');

  var input = 'src/images/pages/';
  var output = 'site/static/images/pages/';

  watchImages();

  function processImages(images, size) {
    images.forEach(function (filepath) {
      var name = path.basename(filepath);
      var img = sharp(filepath);
      img
        .resize( parseInt(size) )
        .toBuffer(function (err, buffer, info) {
          if (err) console.error(err);
          var filename = output + name;
          minify(buffer, filename);
        });
    });
  }

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

  function watchImages() {
    var watcher = chokidar.watch('src/images/pages/**/*', {
      atomic: false
    });

    watcher.on('change', function(filepath) {
      var dirname = path.dirname(filepath).split('/');
      var size = dirname[dirname.length - 1];
      var images = [filepath];
      processImages(images, size);
    });

    watcher.on('unlink', function(filepath) {
      var filename = output + path.basename(filepath);
      fs.unlink(filename, function(err) {
        if (err) console.error(err);
      });
    });
  }

})();
