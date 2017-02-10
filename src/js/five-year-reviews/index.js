(function () {
  'use strict';

  const fs = require('fs');
  const moment = require('moment');
  const xhr = require('xhr');

  const template = require('./li.pug');

  const list = document.querySelector('.five-year-review-list');
  const input = document.querySelector('.five-year-review-search');

  const baseURL = document.body.getAttribute('data-root');
  const url = `${baseURL}data/five-year-reviews.js`;
  let species;

  xhr.get(url, (err, res, body) => {
    if (err) console.log(err);
    species = JSON.parse(body);
    render(species);
    input.addEventListener('keyup', search);
  });

  function search(e) {
    const query = e.target.value;
    const regex = new RegExp(q, 'gi');
    if (query.length === 0) render(species);

    const filtered = species.filter(animal => {
      const isName = regex.test(animal.commonName);
      const isStatus = regex.test(animal.status);
      const isTaxon = regex.test(animal.taxon);
      return (isName || isStatus || isTaxon);
    });
    render(filtered);
  }

  function render(species) {
    const sorted = species.slice().sort(sortByDate);
    list.innerHTML = template({ species: sorted });
  }

  function sortByDate(a, b) {
    if (new Date(a.reviewDate) > new Date(b.reviewDate)) return -1;
    if (new Date(a.reviewDate) < new Date(b.reviewDate)) return 1;
    return 0;
  }

})();
