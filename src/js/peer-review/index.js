const xhr = require('xhr');

const list = document.querySelector('.peer-review-list');
const input = document.querySelector('.peer-review-search');
const baseUrl = document.body.getAttribute('data-root');

let reviews;

const search = (e) => {
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
}

const render = reviews => {
  list.innerHTML = reviews
    .sort(byYear)
    .map(createListItem)
    .join('');
}

const getYearFromDocket = r => r.split('-')[3];

const byYear = (a,b) => {
  const yearA = getYearFromDocket(a.docket);
  const yearB = getYearFromDocket(b.docket);
  return parseInt(yearB) - parseInt(yearA);
}

const createListItem = r => {
  const url = ['https://www.regulations.gov/docket', r.docket].join('?D=');
  return `
    <li class="card card-text">
      <span class="card-ribbon">${r.type}</span>
      <span class="card-date">${getYearFromDocket(r.docket)}</span>
      <p class="card-text">
        <a href="${url}" target="_blank">Species: ${r.species}</a>
      </p>
    </li>
  `;
}

xhr.get(`${baseUrl}data/peer-reviews.js`, (err, res, body) => {
  if (err) console.log(err);
  reviews = JSON.parse(body);
  input.addEventListener('keyup', search);
  render(reviews);
});
