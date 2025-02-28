const mkdirp = require('mkdirp');
const rimraf = require('rimraf');

const directories = [
  'dist/js',
  'dist/data',
  'dist/css',
  'dist/images/hero',
  'dist/images/pages',
  'site/static/css',
  'site/static/data',
  'site/static/js',
  'site/static/images/hero',
  'site/static/images/pages'
];

// Don't blast away CSS, JavaScript, or Images or we'll have to just re-copy them
const options = { glob: { ignore: ['dist/css', 'dist/js', 'dist/images', 'dist/data'] } };

rimraf('dist/*', options, err => {
  if (err) console.error(err);

  directories.forEach(path => {
    mkdirp(path, mkdirpErr => {
      if (err) console.error(mkdirpErr);
    });
  });
});
