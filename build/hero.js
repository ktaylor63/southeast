(function () {
  'use strict';
  var sharp = require('sharp');
  var imagemin = require('imagemin');
  var imageminMozjpeg = require('imagemin-mozjpeg');
  var rimraf = require('rimraf');
  var chokidar = require('chokidar');

  var fs = require('fs');
  var path = require('path');

  var input = 'src/images/hero/';
  var output = 'site/static/images/hero/';
  var images = fs.readdirSync(input);
  var outSize = 1400;

  // If there's a DS Store item, remove it
  var i = images.indexOf('.DS_Store');
  if (i > -1) images.splice(i,1);

  // 1. Clean the output directory site/static/images/hero/
  // 2. Loop through all hero images in src/images/hero
  //    3. Resize image to 1400px wide
  //    4. Optimize image
  //    5. Write file to output directory site/static/images/hero/
  // 6. If the PRODUCTION env variable is NOT set kick off watcher

  init();

  function init() {
    if (process.env.WATCH) {
      console.log('Watching hero images for changes...');
      watcher();
    } else {
      console.log('Processing hero images...');
      rimraf(output + '*', function(err) {
        if (err) console.error(err);
        images.forEach(function(name) {
          processHeroImage( path.join(input, name) );
        });
      });
    }
  }

  function processHeroImage(filepath) {
    var img = sharp(filepath);
    var filename = path.basename(filepath);
    img
      .resize(outSize)
      .toBuffer(function (err, buffer, info) {
        if (err) console.error(err);
        var outfile = output + filename;
        minify(buffer, outfile);
      });
  }

  function watcher() {
    var glob = input + '*';
    chokidar.watch(glob)
      .on('add', processHeroImage)
      .on('change', processHeroImage)
      .on('unlink', removeImage);
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

  function removeImage(filepath) {
    var fileToDelete = path.join( output + path.basename(filepath) );
    fs.access(fileToDelete, function(err) {
      if (err) console.error(err);
      else {
        fs.unlink(fileToDelete, function(err) {
          if (err) console.error(err);
        });
      }
    });
  }

})();
