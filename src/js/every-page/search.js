const lunr = require('lunr');
const xhr = require('xhr');
const S = require('string');

const insertAfter = (el, referenceNode) => {
  referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
}

const index = lunr(function() {
  this.field('title', { boost: 10 });
  this.field('description');
  this.field('tags', { boost: 5 });
  this.field('href');
  this.ref('id');
});

const baseURL = document.body.getAttribute('data-root');
const refNode = document.querySelector('.site-search-button');

let pages;
let results;

const createNewsUrl = (url, date) => {
  const urlPieces = url.split('/');
  const datePieces = date.split('-');
  return [urlPieces[0], datePieces[0], datePieces[1], urlPieces[1]].join('/');
}

const createListItem = p => {
  const url = S(p.href).contains('news') ? createNewsUrl(p.href, p.date) : p.href;
  return `
    <li><a href=${baseURL + url}>${ p.title }</a></li>`;
}

const render = hits => {
  results.innerHTML = hits.map(createListItem).join('');
}

const search = (e) => {
  const query = e.target.value;

  if (query.length === 0) render(pages);

  const hits = index
    .search(query)
    .map(h => pages[h.ref]);

  render(hits);
}

const init = (input, dataURL) => {
  results = document.createElement('ul');
  results.classList.add('search-results');
  insertAfter(results, refNode);

  // Trigger loading animation...

  xhr.get(`${dataURL}/data/search.js`, (err, res, body) => {
    if (err) console.log(err);
    pages = JSON.parse(body)
      .filter(p => p)
      .map((p, i) => {
        return {
          title: p.title,
          description: p.description,
          tags: p.tags ? p.tags.join(' ') : '',
          id: i,
          date: p.date || null,
          href: p.href
        }
      });
    pages.forEach(p => index.add(p) );
    input.addEventListener('keyup', search);
  });
}

module.exports.init = init;
