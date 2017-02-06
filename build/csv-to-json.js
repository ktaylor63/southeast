const each = require('async/each');
const csv = require('csvtojson');
const jsonminify = require('jsonminify');
const rimraf = require('rimraf');
const glob = require('glob');

const fs = require('fs');
const path = require('path');

const csvSrc = 'src/data/**/*.csv';
const dist = 'dist/data/';

function build(done) {
  glob(csvSrc, (err, files) => {
    if (err) return done(err);
    each(files, toJSON, done);
  });
}

function toJSON(filePath, cb) {
  let data = [];
  csv()
    .fromFile(filePath)
    .on('json', (json) => { data.push(json) })
    .on('done', (err) => {
      if (err) console.log(err);
      const basename = path.basename(filePath).replace('csv', 'js');
      const minifiedData = jsonminify(JSON.stringify(data));
      fs.writeFile(`${dist}${basename}`, minifiedData, 'utf8', (err) => {
        if (err) console.log(err);
        if (cb) cb();
      });
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

module.exports.remove = removeCSV;
module.exports.toJSON = toJSON;
module.exports.build = build;
