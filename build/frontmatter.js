const matter = require('gray-matter');
const replace = require('replace-in-file');
const moment = require('moment');
const yaml = require('yamljs');
const toTitleCase = require('titlecase');
const chalk = require('chalk');

const error = chalk.bold.red;

// If you want to use something other than lastUpdate change this var
const propertyName = 'updated';
const dateFormat = 'MMMM Do, YYYY';

function capitalizeTags(tags, title) {
  if (!tags || tags === []) {
    return console.log(error(`You must include at least one tag on ${title}`));
  }
  return tags.map(tag => toTitleCase(tag)).sort();
}

function updateFrontMatter(path, cb) {
  let fm;
  const regex = /^---[\s\S]*?---/;
  try {
    fm = matter.read(path);
  } catch (err) {
    return console.log(error('Could not parse YAML: ', err));
  }

  fm.data[propertyName] = moment().format(dateFormat);
  fm.data.tags = capitalizeTags(fm.data.tags, fm.data.title);

  const output = `---\n${yaml.stringify(fm.data)}---`;

  return replace(
    {
      files: path,
      from: regex,
      to: output
    },
    err => {
      if (err) return cb(err);
      if (cb) return cb();
      return false;
    }
  );
}

module.exports.update = updateFrontMatter;
