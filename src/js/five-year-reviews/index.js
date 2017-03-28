const moment = require('moment');
const xhr = require('xhr');

const list = document.querySelector('.five-year-review-list');
const input = document.querySelector('.five-year-review-search');

let hasWWW = window.location.href.indexOf('www');
hasWWW = (hasWWW < 0) ? false : true;
const baseURL = document.body.getAttribute('data-root');
const dataURL = hasWWW ? baseURL : baseURL.replace('www.', '');

let species;

xhr.get(`${dataURL}data/five-year-reviews.js`, (err, res, body) => {
  if (err) console.log(err);
  species = JSON.parse(body);
  render(species);
  input.addEventListener('keyup', search);
});

function search(e) {
  const query = e.target.value;
  const regex = new RegExp(query, 'gi');
  if (query.length === 0) render(species);

  const filtered = species.filter(animal => {
    const isName = regex.test(animal.commonName);
    const isStatus = regex.test(animal.status);
    const isTaxon = regex.test(animal.taxon);
    return (isName || isStatus || isTaxon);
  });
  render(filtered);
}

function createListItem(species) {
  const date = moment(species.reviewDate).format('MM/DD/YYYY');
  const url = [baseURL, species.url].join('');
  return species.url ?
    `<li>${date}: <a href="${url}" target="_blank">${species.commonName} (${species.status})</a></li>` :
    `<li>${date}: ${species.commonName} (${species.status})</li>`;
}

function render(species) {
  list.innerHTML = species
    .slice()
    .sort(sortByDate)
    .map(createListItem)
    .join('');;
}

function sortByDate(a, b) {
  if (new Date(a.reviewDate) > new Date(b.reviewDate)) return -1;
  if (new Date(a.reviewDate) < new Date(b.reviewDate)) return 1;
  return 0;
}
