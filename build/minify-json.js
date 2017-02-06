const jsonminify = require('jsonminify');
const jsonlint = require('jsonlint');
const rimraf = require('rimraf');
const glob = require('glob');
const each = require('async/each');

const fs = require('fs');
const path = require('path');

const jsonSrc = 'src/data/**/*.json';
const dist = 'dist/data/';

function build(done) {
  glob(jsonSrc, (err, files) => {
    if (err) return done(err);
    each(files, minifyJSON, done);
  });
}

function minifyJSON(filepath, cb) {
  fs.readFile(filepath, 'utf8', (err, json) => {
    if (err) console.log(err);

    if (jsonlint.parse(json)) {
      const basename = path.basename(filepath).replace('json', 'js');
      const outpath = path.join(dist, basename);
      fs.writeFile(outpath, jsonminify(json, 'utf8'), (err) => {
        if (err) console.log(err);
        if (cb) cb();
      });
    } else throw new Error(basename + ' is not valid JSON.')
  });
}

function removeJSON(filepath) {
  const fileToDelete = path.join( dist + path.basename(filepath).replace('json', 'js') );
  fs.access(fileToDelete, (err) => {
    if (err) console.error(err);
    else {
      fs.unlink(fileToDelete, (err) => {
        if (err) console.error(err);
      });
    }
  });
}

module.exports.removeJSON = removeJSON;
module.exports.minifyJSON = minifyJSON;
module.exports.build = build;
