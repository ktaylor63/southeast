const pluralize = require('pluralize');
const isUrl = require('is-url-superb');

const baseURL = document.body.getAttribute('data-root');
const fieldStationName = document.querySelector('.field-station').textContent;
const list = document.querySelector('.document-list');
const input = document.querySelector('.document-search');

let documents = [];

const unique = arrArg => arrArg.filter((elem, pos, arr) => arr.indexOf(elem) === pos);

const alphabetically = (a, b) => a.name.localeCompare(b.name);

const updateUrl = doc => {
  if (isUrl(doc.url)) return doc;
  doc.url = `${baseURL}pdf/${doc.url}`;
  return doc;
};

const template = ({ type, documents: docs }) => {
  const heading = pluralize(type);
  return `
    <h2>${heading}</h2>
    <ul>${docs
    .sort(alphabetically)
    .map(d => {
      const year = d.year ? `(${d.year})` : '';
      return `<li><a href="${d.url}" target="_blank">${d.office} ${
        d.name
      } ${year}</a></li>`;
    })
    .join('')}
    </ul>
  `;
};

const noResults = () => `
  <li class="card">
    <h2>No results found</h2>
  </li>
`

const render = docs => {
  // Create an array of document types (no duplicates)
  const types = unique(docs.map(doc => doc.type)).sort();
  list.innerHTML = '';
  // Sort documents alphabetically
  types.forEach(type => {
    const filtered = docs
      .filter(doc => type === doc.type)
      .map(updateUrl)
      .sort(alphabetically)
      .reverse();
    list.insertAdjacentHTML(
      'beforeend',
      template({ type, documents: filtered })
    );
  });
};

const search = e => {
  const query = new RegExp(e.target.value, 'gi');
  if (!query) render(documents);

  const results = documents.filter(doc => (
    query.test(doc.name)
    || query.test(doc.office)
    || query.test(doc.type)
    || query.test(doc.year)
    || query.test(doc.url)
    || query.test(doc.keywords)
    || query.test(doc.programs)
    || query.test(doc.state)
    )
  );

  render(results);
}

const isFieldStationDocument = doc => {
  const regex = new RegExp(fieldStationName, 'gi');
  return (
    regex.test(doc.name)
    || regex.test(doc.office)
    || regex.test(doc.type)
    || regex.test(doc.year)
    || regex.test(doc.url)
    || regex.test(doc.keywords)
    || regex.test(doc.programs)
    || regex.test(doc.state)
    );
  };

const handleResponse = data => {
  documents = data.filter(isFieldStationDocument);
  render(documents);
  input.addEventListener('keyup', search);
}

fetch(`${baseURL}/data/reading-room-documents.js`)
  .then(res => res.json())
  .then(handleResponse)
  .catch(console.log)
