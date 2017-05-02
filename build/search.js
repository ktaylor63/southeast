const fs = require('fs');
const path = require('path');

const recursive = require('recursive-readdir');
const S = require('string');
const yaml = require('yamljs');
const matter = require('gray-matter');

const src = 'site/content';
const dist = 'dist/data/search.js';
const CONTENT_PATH_PREFIX = 'site/content/';

const generateUrl = filepath => {
  const extension = path.extname(filepath);
  return S(filepath).chompLeft(CONTENT_PATH_PREFIX).chompRight(extension).s;
}

const serializeContent = filepath => {
  const fm = matter.read(filepath);
  const href = fm.data.url ? fm.data.url : generateUrl(filepath);

  if (!fm.data.title) return false;

  return {
    title: fm.data.title,
    description: fm.data.description || S(fm.content).trim().stripTags().s.slice(0,140),
    hero: fm.data.hero,
    tags: fm.data.tags,
    date: fm.data.date,
    href
  }
};

recursive(src, (err, files) => {
  const index = files.map(serializeContent);

  fs.writeFile(dist, JSON.stringify(index), 'utf8', err => {
    if (err) throw err;
  })
});
