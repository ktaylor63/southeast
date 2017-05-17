const fs = require('fs');
const inspect = require('util').inspect;

const parse = require('xml-parser');

const xml = fs.readFileSync('dist/sitemap.xml', 'utf8');
const json = parse(xml);
const data = json.root.children
  .filter(x => x.name === 'url')
  .map(x => x.children
    .filter(y => y.name === 'loc')
    .map(y => y.content)
  );

fs.writeFileSync('test/results/pa11y.json', data, 'utf8');
