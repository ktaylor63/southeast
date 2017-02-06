const path = require('path');
const chokidar = require('chokidar');

const csv = require('./csv-to-json');
const json = require('./minify-json');
const frontmatter = require('./frontmatter');
const hugo = require('./hugo');
const hero = require('./hero');
const images = require('./images');

const devUrl = 'http://localhost:3000/'
const src = path.resolve('../southeast/');
const options = {
  ignoreInitial: true,
  ignored: [
    path.resolve('**/node_modules/**/*'),
    path.resolve('test/**/*'),
    path.resolve('build/**/*'),
    path.resolve('dist/**/*'),
    path.resolve('docs/**/*'),
    path.resolve('.gitignore'),
    path.resolve('.git'),
    path.resolve('package.json'),
  ]
};

const watcher = chokidar.watch(src, options);

watcher
  .on('add', changeHandler)
  .on('change', changeHandler)
  .on('unlink', removeHandler);

function changeHandler(filepath) {
  console.log(`Changed: ${filepath}`);
  if ( isCSVFile(filepath) ) csv.toJSON(filepath);
  if ( isJSONFile(filepath) ) json.minifyJSON(filepath);
  if ( isHeroImage(filepath) ) hero.process(filepath);
  if ( isContentImage(filepath) ) images.process(filepath);
  if ( isImageToCopy(filepath) ) images.copy(filepath);
  if ( isContentFile(filepath) ) {
    frontmatter.update(filepath, (err) => {
      if (err) console.error(err);
      hugo.build(devUrl);
    });
    return; // Return here so we don't trigger two hugo.build()s
  }
  if ( isHugoFile(filepath) ) hugo.build(devUrl);
}

function removeHandler(filepath) {
  console.log(`Removed: ${filepath}`);
  if ( isCSVFile(filepath) ) csv.remove(filepath);
  if ( isJSONFile(filepath) ) json.removeJSON(filepath);
  if ( isHeroImage(filepath) ) hero.remove(filepath);
  if ( isContentImage(filepath) ) images.remove(filepath);
  if ( isHugoFile(filepath) ) hugo.build(devUrl);
}

function isHugoFile(filepath) {
  const isSiteDirectory = filepath.includes('site/');
  return (isSiteDirectory);
}

function isImageToCopy(filepath) {
  const fromContentDir = filepath.includes('src/images/copy');
  return fromContentDir;
}

function isContentFile(filepath) {
  const ext = path.extname(filepath);
  const fromContentDir = filepath.includes('site/content');
  const isCorrectFileType = (ext === '.md' || ext === '.html')
  return (fromContentDir && isCorrectFileType);
}

function isHeroImage(filepath) {
  const ext = path.extname(filepath);
  const fromContentDir = filepath.includes('src/images/hero');
  const isCorrectFileType = (ext === '.jpg')
  return (fromContentDir && isCorrectFileType);
}

function isContentImage(filepath) {
  const ext = path.extname(filepath);
  const fromContentDir = filepath.includes('src/images/pages');
  const isCorrectFileType = (ext === '.jpg')
  return (fromContentDir && isCorrectFileType);
}

function isSVGImage(filepath) {
  const ext = path.extname(filepath);
  const fromContentDir = filepath.includes('src/images/svg');
  const isCorrectFileType = (ext === '.svg')
  return (fromContentDir && isCorrectFileType);
}

function isCSVFile(filepath) {
  const ext = path.extname(filepath);
  const fromDataDir = filepath.includes('src/data');
  const isCorrectFileType = ext === '.csv';
  return (fromDataDir && isCorrectFileType);
}

function isJSONFile(filepath) {
  const ext = path.extname(filepath);
  const fromDataDir = filepath.includes('src/data');
  const isCorrectFileType = ext === '.json';
  return (fromDataDir && isCorrectFileType);
}
