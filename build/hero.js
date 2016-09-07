(function () {
  'use strict';
  var sharp = require('sharp');
  var imagemin = require('imagemin');
  var imageminMozjpeg = require('imagemin-mozjpeg');
  var rimraf = require('rimraf');

  var fs = require('fs');
  var path = require('path');

  var input = 'src/images/hero/';
  var output = 'site/static/images/hero/';
  var images = fs.readdirSync(input);
  var outSize = 1400;

  // If there's a DS Store item, remove it
  var i = images.indexOf('.DS_Store');
  if (i > -1) images.splice(i,1);

  rimraf(output + '*', function(err) {
    if (err) console.error(err);
    processHeroImages(images);
  });

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

})();
