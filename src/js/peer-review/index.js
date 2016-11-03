(function () {
  'use strict';

  var fs = require('fs');
  var filter = require('lodash.filter');

  var template = require('./li.jade');

  var list = document.querySelector('.peer-review-list');
  var input = document.querySelector('.peer-review-search');
  var reviews = JSON.parse( fs.readFileSync('./peer-reviews.js') );

  render(reviews);

  input.addEventListener('keyup', search);

  function search(e) {
    var query = e.target.value.toLowerCase(),
        filtered;

    if (query.length === 0) render(reviews);

    filtered = filter(reviews, function (review) {
      return review.species.toLowerCase().indexOf(query) > -1;
    });
    render(filtered);
  }

  function render(reviews) {
    list.innerHTML = template({ reviews: reviews });
  }
})();
