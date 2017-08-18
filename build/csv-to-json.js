const each = require('async/each');
const csv = require('csvtojson');
const jsonminify = require('jsonminify');
const glob = require('glob');

const fs = require('fs');
const path = require('path');

const csvSrc = 'src/data/**/*.csv';
const dist = 'dist/data/';

function toJSON(filePath, cb) {
  const data = [];
  csv()
    .fromFile(filePath)
    .on('json', json => {
      data.push(json);
    })
    .on('done', err => {
      if (err) console.log(err);
      const basename = path.basename(filePath).replace('csv', 'js');
      const minifiedData = jsonminify(JSON.stringify(data));
      fs.writeFile(`${dist}${basename}`, minifiedData, 'utf8', writeFileErr => {
        if (writeFileErr) console.log(writeFileErr);
        if (cb) cb();
      });
    });
}

function removeCSV(filepath) {
  const fileToDelete = path.join(dist + path.basename(filepath).replace('csv', 'js'));
  fs.access(fileToDelete, err => {
    if (err) console.error(err);
    else {
      fs.unlink(fileToDelete, unlinkErr => {
        if (err) console.error(unlinkErr);
      });
    }
  });
}

function build(done) {
  glob(csvSrc, (err, files) => {
    if (err) return done(err);
    return each(files, toJSON, done);
  });
}

module.exports.remove = removeCSV;
module.exports.toJSON = toJSON;
module.exports.build = build;
