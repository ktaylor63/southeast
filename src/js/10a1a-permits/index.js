const xhr = require('xhr');

const templates = {
  result: require('./result.pug'),
  error: require('./error.pug')
};

let hasWWW = window.location.href.indexOf('www');
hasWWW = (hasWWW < 0) ? false : true;
const baseURL = document.body.getAttribute('data-root');
const dataURL = hasWWW ? baseURL : baseURL.replace('www.', '');

const output = document.querySelector('.output');
const input = document.getElementById('permit-search');
let permits;

xhr.get(`${dataURL}/data/permits.js`, (err, res, body) => {
  permits = JSON.parse(body);
  input.addEventListener('keyup', search);
});

function search(e) {
  const query = e.target.value.toLowerCase();
  const matches = permits.filter(permit => permit.number.toLowerCase() === query);

  if (query.length === 0) {
    output.innerHTML = '';
    return;
  }

  if (matches.length === 1) output.innerHTML = templates.result({ data: matches[0] });
  else output.innerHTML = templates.error();
}
