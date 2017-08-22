const moment = require('moment');
const xhr = require('xhr');

const list = document.querySelector('.five-year-review-list');
const input = document.querySelector('.five-year-review-search');

let hasWWW = window.location.href.indexOf('www');
hasWWW = !(hasWWW < 0);
const baseURL = document.body.getAttribute('data-root');
const dataURL = hasWWW ? baseURL : baseURL.replace('www.', '');

let species;

function sortByDate(a, b) {
  return new Date(b.reviewDate) - new Date(a.reviewDate);
}

function createListItem(animal) {
  const date = moment(animal.reviewDate).format('MM/DD/YYYY');
  const url = [baseURL, animal.url].join('');
  return animal.url
    ? `<li>${date}: <a href="${url}" target="_blank">${animal.commonName} (${animal.status})</a><br><strong>Recommendation: ${animal.recommendation}</strong></li>`
    : `<li>${date}: ${animal.commonName} (${animal.status})<br><strong>Recommendation: ${animal.recommendation}</strong></li>`;
}

function render(animals) {
  list.innerHTML = animals.slice().sort(sortByDate).map(createListItem).join('');
}

function search(e) {
  const query = e.target.value;
  const regex = new RegExp(query, 'gi');
  if (query.length === 0) render(species);

  const filtered = species.filter(animal => {
    const isName = regex.test(animal.commonName);
    const isStatus = regex.test(animal.status);
    const isTaxon = regex.test(animal.taxon);
    return isName || isStatus || isTaxon;
  });
  render(filtered);
}

xhr.get(`${dataURL}data/five-year-reviews.js`, (err, res, body) => {
  if (err) console.log(err);
  species = JSON.parse(body);
  render(species);
  input.addEventListener('keyup', search);
});
