const Rx = require('rxjs/Rx');
const pluralize = require('pluralize');
const isUrl = require('is-url-superb');

const Observable = Rx.Observable;

const createLunrIndex = require('./createLunrIndex');

const baseURL = document.body.getAttribute('data-root');
const fieldStationName = document.querySelector('.field-station').textContent;
const list = document.querySelector('.document-list');
const input = document.querySelector('.document-search');

const unique = arrArg => arrArg.filter((elem, pos, arr) => arr.indexOf(elem) === pos);

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

const render = docs => {
  list.innerHTML = '';
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
    list.insertAdjacentHTML(
      'beforeend',
      template({ type, documents: filtered })
    );
  });
};

const isFieldStationDocument = docs => {
  const regex = new RegExp(fieldStationName, 'gi');
  return docs.filter(
    doc => regex.test(doc.name)
      || regex.test(doc.office)
      || regex.test(doc.type)
      || regex.test(doc.year)
      || regex.test(doc.url)
      || regex.test(doc.keywords)
      || regex.test(doc.programs)
      || regex.test(doc.state)
  );
};

const document$ = Observable.ajax('../../data/reading-room-documents.js')
  .map(req => req.response)
  .map(isFieldStationDocument);

const index$ = document$.map(createLunrIndex);

const keyup$ = Observable.fromEvent(input, 'keyup')
  .map(() => input.value)
  .startWith(input.value);

const searchResultSets = keyup$.combineLatest(document$, index$);

searchResultSets.subscribe(([term, docs, index]) => {
  const results = index.search(term).map(hit => docs[hit.ref]);

  if (term === '') return render(docs);
  return render(results);
});
