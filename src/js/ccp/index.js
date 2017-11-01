const xhr = require('xhr');
const isUrl = require('is-url-superb');

const baseURL = document.body.getAttribute('data-root');
const output = document.querySelector('.ccp-list');
const input = document.querySelector('.ccp-input');
let documents;

const getCCPs = docs => docs.filter(d => d.type === 'Comprehensive Conservation Plan');

const createCCPListItem = ccp => {
  const url = isUrl(ccp.url) ? ccp.url : `https://www.fws.gov/southeast/pdf/${ccp.url}`;
  return `<li><a href="${url}" target="_blank">${ccp.office} (${ccp.year})</a></li>`;
};

const render = docs => {
  const html = docs.map(createCCPListItem).join('');
  output.innerHTML = html;
  return html;
};

const alphabetically = (a, b) => {
  const A = a.office.toLowerCase();
  const B = b.office.toLowerCase();
  if (A < B) return -1;
  else if (A > B) return 1;
  return 0;
};

const search = e => {
  const query = e.target.value;
  const regex = new RegExp(query, 'gi');
  if (query.length === 0) render(documents);

  const filtered = documents.filter(doc => {
    const isOffice = regex.test(doc.office);
    const isYear = regex.test(doc.year);
    const isKeyword = regex.test(doc.keyword);
    return isOffice || isYear || isKeyword;
  });
  render(filtered);
};

xhr.get(`${baseURL}data/reading-room-documents.js`, (err, res, body) => {
  if (err) console.error(err);
  documents = getCCPs(JSON.parse(body)).sort(alphabetically);
  render(documents);
  input.addEventListener('input', search);
});
