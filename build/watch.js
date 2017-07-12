const path = require('path');
const chokidar = require('chokidar');

const csv = require('./csv-to-json');
const json = require('./minify-json');
const frontmatter = require('./frontmatter');
const hugo = require('./hugo');
const hero = require('./hero');
const images = require('./images');

const devUrl = 'http://localhost:3000/'
const options = {
  ignoreInitial: true,
  ignored: [
    '.DS_Store',
    '**/*/.DS_Store',
    'node_modules',
    '**/*/node_modules',
    'test',
    'build',
    'dist',
    'docs',
    '.gitignore',
    '.git',
    'package.json'
  ]
};

const watcher = chokidar.watch('.', options);

watcher
  .on('add', changeHandler)
  .on('change', changeHandler)
  .on('unlink', removeHandler);

function changeHandler(filepath) {
  if (filepath.includes('.DS_Store')) return;
  console.log(`Changed: ${filepath}`);
  if ( isCSVFile(filepath) ) csv.toJSON(filepath);
  if ( isJSONFile(filepath) ) json.minifyJSON(filepath);
  if ( isHeroImage(filepath) ) hero.process(filepath);
  if ( isContentImage(filepath) ) images.process(filepath);
  if ( isImageToCopy(filepath) ) images.copy();
  if ( isContentFile(filepath) ) frontmatter.update(filepath);
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
  return filepath.includes('site/');
}

function isImageToCopy(filepath) {
  return filepath.includes('src/images/copy');
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
