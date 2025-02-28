const async = require('async');

const csv = require('./csv-to-json');
const json = require('./minify-json');
const images = require('./images');
const hero = require('./hero');
const hugo = require('./hugo');

const environment = process.argv[2] ? process.argv[2] : 'development';

async.parallel(
  {
    csv(cb) {
      csv.build(err => {
        if (err) cb(err);
        cb(null, 'Finished converting CSV to JSON.');
      });
    },
    json(cb) {
      json.build(err => {
        if (err) cb(err);
        cb(null, 'Finished minifying JSON data.');
      });
    },
    contentImages(cb) {
      images.build(err => {
        if (err) cb(err);
        cb(null, 'Finished processing content images.');
      });
    },
    copyImages(cb) {
      images.copy(err => {
        if (err) cb(err);
        cb(null, 'Finished copying images.');
      });
    },
    heroImages(cb) {
      hero.build(err => {
        if (err) cb(err);
        cb(null, 'Finished processing hero images.');
      });
    }
  },
  (err, results) => {
    if (err) console.log(err);
    console.log(results);
    hugo.build(environment);
  }
);
