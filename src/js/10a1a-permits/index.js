const xhr = require('xhr');

const templates = {
  result: require('./result.pug'),
  error: require('./error.pug')
};

const output = document.querySelector('.output');
const input = document.getElementById('permit-search');
const baseURL = document.body.getAttribute('data-root');
const url = `${baseURL}data/permits.js`;
let permits;

xhr.get(url, (err, res, body) => {
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
