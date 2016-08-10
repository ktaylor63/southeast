(function () {
  'use strict';

  var fs = require('fs');
  var moment = require('moment');
  var filter = require('lodash.filter');

  var template = require('./li.jade');

  var list = document.querySelector('.five-year-review-list');
  var input = document.querySelector('.five-year-review-search');
  var species = JSON.parse( fs.readFileSync('./documents.js') );

  render(species);

  input.addEventListener('keyup', search);

  function search(e) {
    var query = e.target.value.toLowerCase(),
        filtered;

    if (query.length === 0) render(species);

    filtered = filter(species, function (animal) {
      var isName = animal.commonName.toLowerCase().indexOf(query) > -1;
      var isStatus = animal.status.toLowerCase().indexOf(query) > -1;
      var isTaxon = animal.taxon.toLowerCase().indexOf(query) > -1;
      return (isName || isStatus || isTaxon);
    });
    render(filtered);
  }

  function render(species) {
    list.innerHTML = template({ species: species });
  }

})();
