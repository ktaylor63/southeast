const xhr = require('xhr');

const list = document.querySelector('.peer-review-list');
const input = document.querySelector('.peer-review-search');

let hasWWW = window.location.href.indexOf('www');
hasWWW = !(hasWWW < 0);
const baseURL = document.body.getAttribute('data-root');
const dataURL = hasWWW ? baseURL : baseURL.replace('www.', '');

let reviews;

const getYearFromDocket = r => r.split('-')[3];

const byYear = (a, b) => {
  const yearA = getYearFromDocket(a.docket) || a.fiscalYear;
  const yearB = getYearFromDocket(b.docket) || b.fiscalYear;
  return parseInt(yearB) - parseInt(yearA);
};

const createListItem = r => {
  const url = ['https://www.regulations.gov/docket', r.docket].join('?D=');
  const message = `The SSA for ${r.species} will be peer reviewed in ${r.fiscalYear}.`;
  const anchor = `<a href="${url}" target="_blank">Species: ${r.species}</a>`;
  return `
    <li class="card card-text">
      <span class="card-ribbon">${r.type}</span>
      <span class="card-date">${getYearFromDocket(r.docket) || r.fiscalYear}</span>
      <p class="card-text">
        ${r.docket ? anchor : message}
      </p>
    </li>
  `;
};

const render = docs => {
  list.innerHTML = docs
    .sort(byYear)
    .map(createListItem)
    .join('');
};

const search = e => {
  const query = e.target.value;
  const regex = new RegExp(query, 'gi');

  if (query.length === 0) render(reviews);

  const filtered = reviews.filter(r => {
    const year = getYearFromDocket(r.docket);
    const isSpecies = regex.test(r.species);
    const isType = regex.test(r.type);
    const isYear = regex.test(year);
    const isDocket = regex.test(r.docket);
    return isSpecies || isType || isYear || isDocket;
  });
  render(filtered);
};

xhr.get(`${dataURL}data/peer-reviews.js`, (err, res, body) => {
  if (err) console.log(err);
  reviews = JSON.parse(body);
  input.addEventListener('keyup', search);
  render(reviews);
});
