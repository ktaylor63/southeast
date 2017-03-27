const xhr = require('xhr');
const queryString = require('query-string');
const lunr = require('lunr');
const isUrl = require('is-url-superb');

const template = require('./document-list.pug');
const output = document.querySelector('.output');
const input = document.querySelector('.document-input');
const baseUrl = document.body.getAttribute('data-root');

let documents;

const index = lunr(function() {
  this.field('name', { boost: 10 });
  this.field('office');
  this.field('type', { boost: 5 });
  this.field('url');
  this.field('year');
  this.field('programs', { boost: 3 });
  this.ref('id');
});

const init = () => {
  const value = getQueryStringValue();
  if (value) input.value = value;

  xhr.get(`../data/reading-room-documents.js`, (err, res, body) => {
    if (err) output.innerHTML = `<h2>An error occurred; could not download documents.</h2>`;
    documents = JSON.parse(body);
    seedIndex(documents);
    value ? search({ target: { value: value }}) : render(documents);
    input.addEventListener('change', search);
    input.addEventListener('keyup', search);
  });
}

const getQueryStringValue = () => {
  const queries = ['q', 'query', 's', 'search'];
  const parsed = queryString.parse(location.search);
  let value = false;
  queries.forEach(query => { if (parsed[query]) value = parsed[query]; });
  return value;
}

const search = (e) => {
  const query = e.target.value;
  if (query.length === 0) {
    render(documents);
    return;
  }

  const results = index.search(query)
    .sort((a,b) => a.score < b.score)
    .map(hit => documents[hit.ref]);

  if (results.length === 0) return output.innerHTML = `<h2>Your query did not return any documents.</h2>`;

  return render(results);
}

const updateUrl = doc => {
  if (isUrl(doc.url)) return doc;
  doc.url = `${baseUrl}pdf/${doc.url}`;
  return doc;
}

const render = (docs) => {
  output.innerHTML = '';
  // Create an array of document types (no duplicates)
  const types = [...new Set(docs.map(doc => doc.type))].sort();
  // Sort by office name, and by date if one exists
  types.forEach(type => {
    const filtered = docs
      .filter(doc => type === doc.type)
      .map(updateUrl)
      .sort( (a, b) => a.office < b.office)
      .sort( (a, b) => parseInt(a.year) - parseInt(b.year))
      .reverse();
    output.insertAdjacentHTML('beforeend', template({ type, documents: filtered }));
  });
}

const seedIndex = (docs) => {
  docs.forEach((doc, i) => {
    index.add({
      id: i,
      name: doc.name,
      office: doc.office,
      type: doc.type,
      year: doc.year,
      url: doc.url,
      programs: doc.programs
    });
  });
}

init();
