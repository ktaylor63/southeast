(function () {
  'use strict';
  var sharp = require('sharp');
  var imagemin = require('imagemin');
  var imageminMozjpeg = require('imagemin-mozjpeg');
  var rimraf = require('rimraf');
  var chokidar = require('chokidar');

  var fs = require('fs');
  var path = require('path');

  var input = 'src/images/pages/';
  var output = 'site/static/images/pages/';
  var directories = getDirectories(input);
  var images;

  // 1. Get list of directories in src/images/pages
  // 2. Loop through each directory
  //    3. Get the directory's name, which is a number
  //       representing the desired image output size
  //    4. Get a list of images from the directory
  //    5. Resize the image
  //    6. Optimize the image
  //    7. Write file to disk
  // 8. If the PRODUCTION env variable is NOT set, kick off the watcher

  rimraf(output + '*', init);

  function init() {
    if (process.env.PRODUCTION) {
      console.log('Processing images...');

      directories.forEach(function (size) {
        var currentDir = input + size + '/';

        fs.readdir(currentDir, function(err, files) {
          if (err) console.error(err);
          // If there's a DS Store item, remove it
          var i = files.indexOf('.DS_Store');
          if (i > -1) files.splice(i,1);

          files.forEach(function (name) {
            processImage( path.join(input, size, name), parseInt(size) );
          });
        });

      });
    } else {
      console.log('Processing hero images and watching for changes...');
      watcher();
    }
  }

  function processImage(filepath, size) {
    if (filepath.indexOf('.DS_Store') > -1) return;
    if (typeof size !== 'number') size = getImageSize(filepath);
    var outfile = path.join( output, path.basename(filepath) );
    var img = sharp(filepath);
    img
      .resize(size)
      .toBuffer(function (err, buffer, info) {
        if (err) console.error(err);
        minify(buffer, outfile);
      });
  }

  function getImageSize(filepath) {
    var pathArray = path.dirname(filepath).split('/');
    return parseInt(pathArray[pathArray.length - 1]);
  }

  function watcher() {
    var glob = input + '**/*';
    chokidar.watch(glob)
      .on('add', processImage)
      .on('change', processImage)
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

  function getDirectories(srcPath) {
    return fs.readdirSync(srcPath).filter(function(file) {
      return fs.statSync(path.join(srcPath, file)).isDirectory();
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
