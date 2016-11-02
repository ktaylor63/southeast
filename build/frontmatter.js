(function () {
  'use strict';

  var chokidar = require('chokidar');
  var matter = require('gray-matter');
  var replace = require('replace-in-file');
  var moment = require('moment');
  var yaml = require('yamljs');
  var toTitleCase = require('titlecase');

  // If you want to use something other than lastUpdate change this var
  var propertyName = 'updated';
  var contentDir = 'site/content/**/*.{md,html}';
  var dateFormat = 'MMMM Do, YYYY';

  chokidar.watch(contentDir).on('change', updateFrontMatter);

  function updateFrontMatter(path) {
    var regex = /^---[\s\S]*?---/;
    var fm = matter.read(path);
    console.log(fm.data.tags);
    fm.data[propertyName] = moment().format(dateFormat);
    fm.data.tags = capitalizeTags(fm.data.tags);
    checkHeroImage(fm.data.hero);

    var output = '---\n' + yaml.stringify(fm.data) + '---';

    replace({
      files: path,
      replace: regex,
      with: output
    }, function (err, files) {
      if (err) return console.error(err);
    });
  }

  function capitalizeTags(tags) {
    if (!tags || tags === []) return console.warn('You must include at least one tag per piece of content!');

    tags.forEach(function(tag, i) {
      tags[i] = toTitleCase(tag);
    });

    return tags;
  }

  function checkHeroImage(hero) {
    if (!hero) return console.warn('Each page requires a Hero image.');
    if (!hero.name) return console.warn('You must include a filename for the hero image.');
    if (!hero.alt) return console.warn('You must include alt text for the hero image.');
    if (!hero.caption) return console.warn('You must include a caption for the hero image.');
  }

})();
