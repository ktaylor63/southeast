(function () {
  'use strict';

  var jsonminify = require('jsonminify');
  var jsonlint = require('jsonlint');
  var chokidar = require('chokidar');
  var rimraf = require('rimraf');
  var glob = require('glob');

  var fs = require('fs');
  var path = require('path');

  var jsonSrc = 'src/data/**/*.json';
  var dist = 'site/static/data/';

  init();

  function init() {
    if (process.env.WATCH) {
      chokidar.watch(jsonSrc, {
        ignoreInitial: true
      })
        .on('add', minifyJson)
        .on('change', minifyJson)
        .on('unlink', removeJson)
    } else {
      rimraf(dist + '*', function() {
        glob(jsonSrc, function (err, files) {
          if (err) console.error(err);
          files.forEach(minifyJson);
        });
      });
    }
  }

  function minifyJson(file) {
    fs.readFile(file, 'utf8', function(err, json) {
      if (jsonlint.parse(json)) {
        var basename = path.basename(file).replace('json', 'js');
        fs.writeFile(dist + basename, jsonminify(json, 'utf8'));
      } else throw new Error(basename + ' is not valid JSON.')
    });
  }

  function removeJson(filepath) {
    var fileToDelete = path.join( dist + path.basename(filepath).replace('json', 'js') );
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
