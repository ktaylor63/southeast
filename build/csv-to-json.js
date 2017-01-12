const csv = require('csvtojson');
const jsonminify = require('jsonminify');
const chokidar = require('chokidar');
const rimraf = require('rimraf');
const glob = require('glob');

var fs = require('fs');
var path = require('path');

var csvSrc = 'src/data/**/*.csv';
var dist = 'dist/data/';

init();

function init() {
  if (process.env.WATCH) {
    chokidar.watch(csvSrc)
      .on('add', convertCSV)
      .on('change', convertCSV)
      .on('unlink', removeCSV)
  } else {
    rimraf(dist + '*.csv', () => {
      glob(csvSrc, (err, files) => {
        if (err) console.error(err);
        files.forEach(convertCSV);
      });
    });
  }
}

function convertCSV(filePath) {
  let data = [];
  csv()
    .fromFile(filePath)
    .on('json', (json) => { data.push(json) })
    .on('done', (err) => {
      if (err) console.log(err);
      const basename = path.basename(filePath).replace('csv', 'js');
      fs.writeFile(dist + basename, jsonminify(JSON.stringify(data), 'utf8'));
    });
}

function removeCSV(filepath) {
  var fileToDelete = path.join( dist + path.basename(filepath).replace('csv', 'js') );
  fs.access(fileToDelete, (err) => {
    if (err) console.error(err);
    else {
      fs.unlink(fileToDelete, (err) => {
        if (err) console.error(err);
      });
    }
  });
}
