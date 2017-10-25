const async = require('async');
const sharp = require('sharp');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const rimraf = require('rimraf');
const ncp = require('ncp').ncp;

ncp.limit = 16;

const fs = require('fs');
const path = require('path');

const input = 'src/images/pages/';
const output = 'site/static/images/pages/';
// const output = 'dist/images/pages/';

function copy(done) {
  ncp('src/images/copy', 'site/static/images/', done);
  // ncp('src/images/copy', 'dist/images/', done);
}

function getImageSize(filepath) {
  const pathArray = path.dirname(filepath).split('/');
  return parseInt(pathArray[pathArray.length - 1]);
}

function minify(buffer, filename, done) {
  imagemin
    .buffer(buffer, {
      plugins: [imageminMozjpeg(), imageminPngquant()]
    })
    .then(img => {
      fs.writeFile(filename, img, 'utf8', err => {
        if (err) console.error(err);
        if (done) done();
      });
    })
    .catch(console.log);
}

function processImage(filepath, size, done) {
  const imgSize = size || getImageSize(filepath);
  if (filepath.indexOf('.DS_Store') > -1) return;
  const outfile = path.join(output, path.basename(filepath));
  const img = sharp(filepath);
  img.resize(imgSize).toBuffer((err, buffer) => {
    if (err) console.error(err);
    minify(buffer, outfile, done);
  });
}

function processImagesInDirectory(size, cb) {
  const dir = path.resolve(input, size);
  fs.readdir(dir, (err, files) => {
    if (err) return cb(err);
    // If there's a DS Store item, remove it
    const i = files.indexOf('.DS_Store');
    if (i > -1) files.splice(i, 1);
    async.eachLimit(
      files,
      5,
      (name, done) => {
        const filepath = path.join(input, size, name);
        const sizeInt = parseInt(size);
        processImage(filepath, sizeInt, done);
      },
      cb
    );
    return true;
  });
}

function filterDirectories(file, done) {
  const thePath = path.join(input, file);
  fs.stat(thePath, (err, stat) => {
    if (err) done(err);
    done(null, stat.isDirectory());
  });
}

function getDirectories(inputDir, cb) {
  fs.readdir(inputDir, (err, files) => {
    if (err) return err;
    return async.filter(files, filterDirectories, cb);
  });
}

function removeImage(filepath) {
  const fileToDelete = path.join(output + path.basename(filepath));
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
  rimraf(`${output}*`, err => {
    if (err) return done(err);

    return getDirectories(input, (dirErr, directories) => {
      if (dirErr) return done(dirErr);
      return async.each(directories, processImagesInDirectory, done);
    });
  });
}

module.exports.process = processImage;
module.exports.remove = removeImage;
module.exports.build = build;
module.exports.copy = copy;

require('make-runnable');
