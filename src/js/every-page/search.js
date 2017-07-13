const lunr = require('lunr');
const xhr = require('xhr');
const S = require('string');
const moment = require('moment');

const container = document.querySelector('.site-wide-search');

let options = {
  active: false,
  className: 'active',
  container,
  close: container.querySelector('.close')
};

const toggle = () => {
  options.container.classList.toggle(options.className);
  options.active = !options.active;
  if (options.active) options.input.focus();
}

const baseURL = document.body.getAttribute('data-root');
const refNode = document.querySelector('.site-search-button');

let pages;
let results;
let index;

const createNewsUrl = (url, date) => {
  if (!url || !date) return;
  const urlPieces = url.split('/');
  const datePieces = date.split('-');
  return [urlPieces[0], datePieces[0], datePieces[1], urlPieces[1]].join('/');
}

const createListItem = p => {
  const sec = S(p.section).replaceAll('-', ' ').s;
  const url = S(p.uri).contains('news') ? createNewsUrl(p.uri, p.date) : p.uri;
  const img = p.img ? `<img src="${baseURL}images/hero/small/${p.img}" alt="${p.alt}" />` : '';
  const section = p.date ?
    `<span class="content-type">${sec}</span> | ${moment(p.date).format('MMM D, YYYY')}` :
    `<span class="content-type">${sec}</span>`;
  return `
    <li class="site-wide-search-item">
      <div class="search-item-content">
        <div class="search-item-image">
          ${img}
          <p>${section}</p>
        </div>
        <div class="search-item-content-text">
          <h3><a href=${url}>${ p.title }</a></h3>
          <p>${p.summary} <a href="${url}">Read more...</a></p>
        </div>
      </div>
    </li>`;
}

const render = hits => {
  const html = hits.map(createListItem).join('');
  results.innerHTML = html;
}

const closeSearchComponent = e => {
  const key = e.which || e.keyCode;
  if (key === 27 && options.active) toggle();
}

const search = e => {
  const query = e.target.value;

  if (query.length === 0) render(pages);

  const hits = index
    .search(query)
    .map(h => pages[h.ref]);

  render(hits);
}

const init = (input, dataURL) => {
  results = document.querySelector('.site-wide-search-results');
  options.input = input;

  xhr.get(`${baseURL}data/search.js`, (err, res, body) => {
    if (err) console.log(err);
    pages = JSON.parse(body)
      .map((p, i) => {
        return {
          title: p.title,
          summary: p.summary,
          tags: p.tags,
          uri: p.uri,
          section: p.section,
          date: p.date,
          updated: p.updated,
          alt: p.alt,
          caption: p.caption,
          img: p.img,
          id: i
        }
      });
    index = lunr(function() {
      this.field('title', { boost: 10 });
      this.field('summary');
      this.field('tags', { boost: 5 });
      this.field('uri', { boost: 3 });
      this.field('section');
      this.field('date');
      this.field('updated');
      this.field('alt');
      this.field('caption');
      this.field('img');
      this.ref('id');
      pages.forEach(p => this.add(p), this);
    });
    window.addEventListener('keyup', closeSearchComponent);
    input.addEventListener('keyup', search);
    options.close.addEventListener('click', toggle);
  });
}

module.exports.init = init;
module.exports.toggle = toggle;
