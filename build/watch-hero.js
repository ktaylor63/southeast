(function () {
  'use strict';
  var sharp = require('sharp');
  var imagemin = require('imagemin');
  var imageminMozjpeg = require('imagemin-mozjpeg');
  var chokidar = require('chokidar')

  var fs = require('fs');
  var path = require('path');

  var input = 'src/images/hero/';
  var output = 'site/static/images/hero/';
  var outSize = 1400;

  watchHeroImages();

  function processHeroImages(images) {
    images.forEach(function (name) {
      var img = sharp(input + name);
      img
        .resize(outSize)
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

  function watchHeroImages() {
    var watcher = chokidar.watch('src/images/hero/*', {
      atomic: false
    });

    watcher.on('change', function(filepath) {
      var filepath = path.basename(filepath);
      var images = [filepath];
      processHeroImages(images);
    });

    watcher.on('unlink', function(filepath) {
      var filename = output + path.basename(filepath);
      fs.unlink(filename, function(err) {
        if (err) console.error(err);
      });
    });
  }

})();
