const xhr = require('xhr');
const queryString = require('query-string');

const template = require('./document-list.pug');
const output = document.querySelector('.output');
const input = document.querySelector('.document-input');
const baseUrl = document.body.getAttribute('data-root');

let documents;

init();

function init() {
  const value = getQueryStringValue();
  if (value) input.value = value;

  xhr.get(`${baseUrl}data/reading-room-documents.js`, (err, res, body) => {
    if (err) console.log(err);
    documents = JSON.parse(body);
    value ? search({ target: { value: value }}) : render(documents);
    input.addEventListener('change', search);
    input.addEventListener('keyup', search);
  });
}

function getQueryStringValue() {
  const queries = ['q', 'query', 's', 'search'];
  const parsed = queryString.parse(location.search);
  let value = false;
  queries.forEach(query => { if (parsed[query]) value = parsed[query]; });
  return value;
}

function search(e) {
  const query = e.target.value;
  const regex = new RegExp(query, 'gi');
  if (query.length === 0) render(documents);

  const filtered = documents.filter(doc => {
    const isType = regex.test(doc.type);
    const isOffice = regex.test(doc.office);
    const isYear = regex.test(doc.year);
    const isName = regex.test(doc.name);
    return (isType || isOffice || isYear || isName);
  });

  render(filtered);
}

function render(documents) {
  output.innerHTML = '';
  // Create an array of document types (no duplicates)
  const types = [...new Set(documents.map(doc => doc.type))].sort();
  // Sort by office name, and by date if one exists
  types.forEach(type => {
    const filtered = documents
      .filter(doc => type === doc.type)
      .sort( (a, b) => {
        if (a.office > b.office) return -1;
        else if (a.office < b.office) return 1;
        else return 0;
      })
      .sort( (a, b) => parseInt(a.year) - parseInt(b.year))
      .reverse();
    output.insertAdjacentHTML('beforeend', template({ type, documents: filtered }));
  });
}
