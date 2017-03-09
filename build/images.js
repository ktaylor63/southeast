const async = require('async');
const sharp = require('sharp');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const rimraf = require('rimraf');
const ncp = require('ncp').ncp;

ncp.limit = 16;

const fs = require('fs');
const path = require('path');

const input = 'src/images/pages/';
const output = 'dist/images/pages/';
let images;

function copy(done) {
  ncp('src/images/copy', 'dist/images/', done);
}

function build(done) {
  rimraf(output + '*', function(err) {
    if (err) return done(err);

    getDirectories(input, (err, directories) => {
      if (err) return done(err);
      async.each(directories, processImagesInDirectory, done);
    });
  });
}

function processImagesInDirectory(size, cb) {
  const dir = path.resolve(input, size);
  fs.readdir(dir, (err, files) => {
    if (err) return cb(err);
    // If there's a DS Store item, remove it
    const i = files.indexOf('.DS_Store');
    if (i > -1) files.splice(i,1);
    async.each(files, (name, done) => {
      const filepath = path.join(input, size, name);
      const sizeInt = parseInt(size);
      processImage(filepath, sizeInt, done);
    }, cb);
  });
}

function getDirectories(input, cb) {
  fs.readdir(input, (err, files) => {
    if (err) return (err);
    async.filter(files, filterDirectories, cb);
  });
}

function filterDirectories(file, done) {
  const thePath = path.join(input, file);
  fs.stat(thePath, (err, stat) => {
    if (err) done(err);
    done(null, stat.isDirectory());
  });
}

function processImage(filepath, size, done) {
  if (filepath.indexOf('.DS_Store') > -1) return;
  if (typeof size !== 'number') size = getImageSize(filepath);
  const outfile = path.join( output, path.basename(filepath) );
  const img = sharp(filepath);
  img
    .resize(size)
    .toBuffer((err, buffer, info) => {
      if (err) console.error(err);
      minify(buffer, outfile, done);
    });
}

function getImageSize(filepath) {
  const pathArray = path.dirname(filepath).split('/');
  return parseInt(pathArray[pathArray.length - 1]);
}

function minify(buffer, filename, done) {
  imagemin.buffer(buffer, filename, {
    plugins: [
      imageminMozjpeg()
    ]
  }).then(buffer => {
    fs.writeFile(filename, buffer, 'utf8', (err) => {
      if (err) console.error(err);
      if (done) done();
    });
  });
}

function removeImage(filepath) {
  const fileToDelete = path.join( output + path.basename(filepath) );
  fs.access(fileToDelete, (err) => {
    if (err) console.error(err);
    else {
      fs.unlink(fileToDelete, (err) => {
        if (err) console.error(err);
      });
    }
  });
}

module.exports.process = processImage;
module.exports.remove = removeImage;
module.exports.build = build;
module.exports.copy = copy;

require('make-runnable');
