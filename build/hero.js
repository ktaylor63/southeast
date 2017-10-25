const async = require('async');
const sharp = require('sharp');
const mkdirp = require('mkdirp');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const rimraf = require('rimraf');

const fs = require('fs');
const path = require('path');

const input = 'src/images/hero/';
const output = 'site/static/images/hero/';
// const output = 'dist/images/hero/';

const outSizes = [
  {
    width: 1400,
    path: '/'
  },
  {
    width: 850,
    path: 'medium/'
  },
  {
    width: 450,
    path: 'small/'
  }
];

function minify(buffer, filename, done) {
  imagemin
    .buffer(buffer, {
      plugins: [imageminMozjpeg()]
    })
    .then(img => {
      const directory = path.dirname(filename);
      mkdirp(directory, err => {
        if (err) console.log(err);
        fs.writeFile(filename, img, done);
      });
    })
    .catch(err => {
      if (done && err) return done(err);
      if (err) console.log(err);
      return false;
    });
}

function processHeroImage(filepath, done) {
  const img = sharp(filepath);
  const filename = path.basename(filepath);
  async.each(
    outSizes,
    (outsize, cb) => {
      img.resize(outsize.width).toBuffer((err, buffer) => {
        if (err) console.error(err);
        const outfile = path.join(output, outsize.path, filename);
        minify(buffer, outfile, cb);
      });
    },
    done
  );
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
  rimraf(`${output}/**/*.jpg`, err => {
    if (err) return done(err);

    fs.readdir(input, (readErr, files) => {
      if (readErr) return done(readErr);

      // Remove .DS_Store files, they're the worst.
      const filtered = files.filter(file => file !== '.DS_Store');

      return async.eachLimit(
        filtered,
        5,
        (name, cb) => {
          const filepath = path.join(input, name);
          processHeroImage(filepath, cb);
        },
        done
      );
    });
    return true;
  });
}

module.exports.process = processHeroImage;
module.exports.remove = removeImage;
module.exports.build = build;

require('make-runnable');
