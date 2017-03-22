const async = require('async');

const csv = require('./csv-to-json');
const json = require('./minify-json')

async.parallel({
  csv: function(cb) {
    csv.build(err => {
      if (err) cb(err);
      cb(null, 'Finished converting CSV to JSON.');
    });
  },
  json: function(cb) {
    json.build(err => {
      if (err) cb(err);
      cb(null, 'Finished minifying JSON data.');
    });
  }
}, (err, results) => {
  if (err) console.log(err);
  console.log(results);
});
