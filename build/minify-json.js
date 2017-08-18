const jsonminify = require('jsonminify');
const jsonlint = require('jsonlint');
const glob = require('glob');
const each = require('async/each');

const fs = require('fs');
const path = require('path');

const jsonSrc = 'src/data/**/*.json';
const dist = 'dist/data/';

function minifyJSON(filepath, cb) {
  fs.readFile(filepath, 'utf8', (err, json) => {
    if (err) console.log(err);
    const basename = path.basename(filepath).replace('json', 'js');

    if (jsonlint.parse(json)) {
      const outpath = path.join(dist, basename);
      fs.writeFile(outpath, jsonminify(json, 'utf8'), writeErr => {
        if (writeErr) console.log(writeErr);
        if (cb) cb();
      });
    } else throw new Error(`${basename} is not valid JSON.`);
  });
}

function removeJSON(filepath) {
  const fileToDelete = path.join(dist + path.basename(filepath).replace('json', 'js'));
  fs.access(fileToDelete, err => {
    if (err) console.error(err);
    else {
      fs.unlink(fileToDelete, unlinkErr => {
        if (unlinkErr) console.error(unlinkErr);
      });
    }
  });
}

function build(done) {
  glob(jsonSrc, (err, files) => {
    if (err) return done(err);
    return each(files, minifyJSON, done);
  });
}

module.exports.removeJSON = removeJSON;
module.exports.minifyJSON = minifyJSON;
module.exports.build = build;
