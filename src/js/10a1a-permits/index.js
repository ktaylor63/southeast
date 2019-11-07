const xhr = require('xhr');

let hasWWW = window.location.href.indexOf('www');
hasWWW = !((hasWWW < 0));
const baseURL = document.body.getAttribute('data-root');
const dataURL = hasWWW ? baseURL : baseURL.replace('www.', '');

const output = document.querySelector('.output');
const input = document.getElementById('permit-search');
let permits;

xhr.get(`${dataURL}/data/permits.js`, (err, res, body) => {
  if (err) console.log(err);
  permits = JSON.parse(body);
  input.addEventListener('keyup', search);
});

function search(e) {
  const query = e.target.value;
  const regex = new RegExp(query, 'gi');
  const matches = permits.filter(permit => regex.test(permit.number));
  console.log(matches);

  if (query.length === 0) return output.innerHTML = '';

  if (matches) output.innerHTML = render(matches);
  else output.innerHTML = '<p>Could not find a permit application matching that number.</p>';
}

function createListItem(match) {
  return `
    <li class="card card-text">
      <p>Status for ${match.number}: ${match.status}</p>
      <p><em>Federal Register</em> Status: ${match.fed_register}</p>
    </li>
  `;
}

const render = (matches) => `<ul class="card-list">${matches.map(createListItem).join('')}</ul>`;
