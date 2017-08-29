const xhr = require('xhr');
const queryString = require('query-string');
const lunr = require('lunr');
const isUrl = require('is-url-superb');
const pluralize = require('pluralize');

const output = document.querySelector('.output');
const input = document.querySelector('.document-input');

let hasWWW = window.location.href.indexOf('www');
hasWWW = !(hasWWW < 0);
const baseURL = document.body.getAttribute('data-root');
const dataURL = hasWWW ? baseURL : baseURL.replace('www.', '');

const unique = arrArg => arrArg.filter((elem, pos, arr) => arr.indexOf(elem) === pos);

const template = ({ type, documents: docs }) => {
  const heading = pluralize(type);
  return `
    <h2>${heading}</h2>
    <ul>${docs
    .map(d => {
      const year = d.year ? `(${d.year})` : '';
      return `<li><a href="${d.url}" target="_blank">${d.office} ${d.name} ${year}</a></li>`;
    })
    .join('')}
    </ul>
  `;
};

let documents;

const index = lunr(function seedIndex() {
  this.field('name', { boost: 10 });
  this.field('office');
  this.field('type', { boost: 5 });
  this.field('url');
  this.field('year');
  this.field('programs', { boost: 3 });
  this.field('keywords');
  this.ref('id');
});

const getQueryStringValue = () => {
  const queries = ['q', 'query', 's', 'search'];
  const parsed = queryString.parse(location.search);
  let value = false;
  queries.forEach(query => {
    if (parsed[query]) value = parsed[query];
  });
  return value;
};

const updateUrl = doc => {
  if (isUrl(doc.url)) return doc;
  doc.url = `${baseURL}pdf/${doc.url}`;
  return doc;
};

const render = docs => {
  output.innerHTML = '';
  // Create an array of document types (no duplicates)
  const types = unique(docs.map(doc => doc.type)).sort();
  // Sort by office name, and by date if one exists
  types.forEach(type => {
    const filtered = docs
      .filter(doc => type === doc.type)
      .map(updateUrl)
      .sort((a, b) => a.office < b.office)
      .sort((a, b) => parseInt(a.year) - parseInt(b.year))
      .reverse();
    output.insertAdjacentHTML('beforeend', template({ type, documents: filtered }));
  });
};

const seedIndex = docs => {
  docs.forEach((doc, i) => {
    index.add({
      id: i,
      name: doc.name,
      office: doc.office,
      type: doc.type,
      year: doc.year,
      url: doc.url,
      keywords: doc.keywords,
      programs: doc.programs
    });
  });
};

const search = e => {
  const query = e.target.value;
  if (query.length === 0) {
    render(documents);
    return;
  }

  const results = index
    .search(query)
    .sort((a, b) => a.score < b.score)
    .map(hit => documents[hit.ref]);

  if (results.length === 0) {
    output.innerHTML = '<h2>Your query did not return any documents.</h2>';
  }
  render(results);
};

const init = () => {
  const value = getQueryStringValue();
  if (value) input.value = value;

  xhr.get(`${dataURL}data/reading-room-documents.js`, (err, res, body) => {
    if (err) output.innerHTML = '<h2>An error occurred; could not download documents.</h2>';
    documents = JSON.parse(body);
    seedIndex(documents);
    if (value) search({ target: { value } });
    else render(documents);
    input.addEventListener('change', search);
    input.addEventListener('keyup', search);
  });
};

init();
